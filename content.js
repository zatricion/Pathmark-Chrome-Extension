;

var URL = document.URL;
var URL = URL.substr(URL.indexOf(':') + 1);

var REF = document.referrer;
var REF = REF.substr(REF.indexOf(':') + 1);

var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ?
                         'runtime' : 'extension';

chrome[runtimeOrExtension].sendMessage({referrer:REF, url:URL}, function() {});


