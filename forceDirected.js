;
(function () {
  plotPathmark = function (links) {
    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
      link.source = nodes[link.source] || 
          (nodes[link.source] = {name: link.source, favicon: link.favicon});
      link.target = nodes[link.target] || 
          (nodes[link.target] = {name: link.target, favicon: link.favicon});
    });

    console.log(nodes);

    var width = 960;
    var height = 500;

    var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(60)
      .charge(-300)
      .on("tick", tick)
      .start();

    var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("left", 0)
      .style("top", 0)
      .style("position", "fixed");

    var link = svg.selectAll(".link")
      .data(force.links())
      .enter().append("line")
      .attr("class", "link")
      .style("stroke", "white")
      .style("stroke-width", 3);

    var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .call(force.drag);

    var defs = svg.append("defs");

    var pattern = defs.selectAll(".pattern")
      .data(force.nodes())
      .enter().append("pattern")
      .attr("class", "pattern")
      .attr("id", function (d, i) {return "pattern-" + i;})
      .attr("width", 32)
      .attr("height", 32)
      .attr("patternContentUnits", "objectBoundingBox")
      .append("image")
      .attr("xlink:href", function (d) {return d.favicon})
      .attr("width", 1)
      .attr("height", 1);

    node.append("circle")
      .attr("r", 16)
      .attr("fill", function (d, i) {return "url(#pattern-" + i + ")" })
      .style("stroke", "white")
      .style("stroke-width", 2);

    node.append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

    function tick() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    }

    function mouseover() {
      d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 24);
    }

    function mouseout() {
      d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 16);
    }

  }
})();
