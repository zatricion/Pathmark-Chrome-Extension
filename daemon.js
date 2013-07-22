;

var nodes = chrome.storage.local;
var pmarks = chrome.storage.sync;

// Clear chrome local storage each session
nodes.clear();
console.log("Cleared local storage");

var createNode = function (url, referrer) {
  urlMatch = '*:' + url;
  chrome.tabs.query({url: urlMatch}, function(tabs) {
    var tab = tabs[0];
    var newUrl = tab.url ? tab.url.replace(/#.*$/, '') : ''; // drop #hash
    var favicon;
    var delay;

    if (tab.favIconUrl && tab.favIconUrl != '' 
      && tab.favIconUrl.indexOf('chrome://favicon/') == -1) {
      // favicon appears to be a normal url
      favicon = tab.favIconUrl;
    delay = 0;
  }
    else {
      // couldn't obtain favicon as a normal url, try chrome://favicon/url
      favicon = 'chrome://favicon/' + newUrl;
      delay = 2000; // larger values will probably be more reliable
    }

  setTimeout(function() {
    // set favicon wherever it needs to be set here
    saveNode(url, referrer, favicon);
  }, delay);
  });
}


var saveNode = function (url, referrer, favicon) {
  var edge = {
    in_node: referrer,
    favicon: favicon,
    timestamp: Date()
  };

  nodes.get(url, function(currentNode){
    currentNode[url] = currentNode[url] || [];
    currentNode[url].push(edge);
    nodes.set(currentNode, function(response){
      if ( chrome.runtime.lastError ) {
        console.log(chrome.runtime.lastError);
      }
      else {
        if (currentNode[url].length > 1) {
          console.log("Updated Node with url " + url + " and created new edge from " + 
            edge.in_node + " at time " + edge.timestamp);
        }
        else {
          console.log("Created new Node for url " + url + " and new edge from " + 
            edge.in_node + " at time " + edge.timestamp);
        }
      }
    });
  });
}


// TODO: Implement user interface and let user save pathmark as something -
// that thing is then the key to a storage.sync object which contains the pathmark

var handleReferrers = function(referrers, output, callback) {
  if (referrers.length > 0) {
    savePath(referrers[0].in_node, output, function(newOutput) {
      handleReferrers(referrers.slice(1), newOutput, callback);
    });
  } else {
    callback(output);
  }
};

var savePath = function(url, output, callback) {
  nodes.get(url, function(refObj) {
    // First predicate stops infinite loops and re-adding objects
    if (output[url] === undefined && refObj[url] !== undefined) {
      var referrers = refObj[url];
      output[url] = referrers;
      handleReferrers(referrers, output, function(finalOutput) {
        callback(finalOutput);
      });
    } else {
      callback(output);
    }
  });
};

var createPathmark = function (stripped, title) {
  savePath(stripped, {}, function (output) {
    var pathmark = {};
    pathmark[title] = output;
    pmarks.set(pathmark);
  });
}

//           //
// LISTENERS //
//           //

var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ?
                         'runtime' : 'extension';

chrome[runtimeOrExtension].onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message_type === "node") {
      createNode(request.url, request.referrer);
    }
    else if (request.message_type === "pathmark") {
      createPathmark(request.url, request.name);
    }
 });
