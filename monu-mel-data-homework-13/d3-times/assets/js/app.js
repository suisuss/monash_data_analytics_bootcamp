// Style parameters 
var width = parseInt(d3.select("#scatter").style("width"));
var height = width - width / 3.9;
var margin = 20;
var labelArea = 110;
var tPadBot = 40;
var tPadLeft = 40;

// Canvas for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Radius for each point in the graph.
var circRadius;

function crGet() {
  if (width <= 530) {
    circRadius = 5;
  }
  else {
    circRadius = 10;
  }
}
crGet();

// Axes labels

// X Axis

// Group element to nest our bottom axes labels.
svg.append("g").attr("class", "xText");

// Select xText
var xText = d3.select(".xText");

// Give xText a transform and translate property that places it at the bottom of the chart.
// By nesting this attribute in a function, we can easily change the location of the label group
// whenever the width of the window changes.
function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}

xTextRefresh();

// Adding three text SVG files as X Axis labels, using a y coordinate to seperate the evenly.

// X Axis Label: Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

// X Axis Label: Age

xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

// X Axis Label: Income

xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// Y Axis

// Style values
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

// Y axis label group
svg.append("g").attr("class", "yText");

// Select yText
var yText = d3.select(".yText");

// Transform attr in a function to make changing it on window change an easy operation.
function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)" // Rotate Y axis labels to appear verticle
  );
}
yTextRefresh();

// Y Axis Label: Obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

// Y Axis Label: Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// Y Axis Label: Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// Import our CSV data with d3.
d3.csv("assets/data/data.csv").then(function(data) {
  // Visualize the data
  visualize(data);
});

// Visualization function
function visualize(theData) {
  // Local Variables and Functions

  // Initiate essential variables, which carry the same names
  // as the headings .csv data file.
  var curX = "poverty";
  var curY = "obesity";

  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // Creating tooltip (Markers)
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(data) {
      var theX;
      var theState = "<div>" + data.state + "</div>";
      var theY = "<div>" + curY + ": " + data[curY] + "%</div>";
      // Format display of data according to x key
      if (curX === "poverty") {
        // Formatted to show percentage
        theX = "<div>" + curX + ": " + data[curX] + "%</div>";
      }
      else {
        // Formatted to include commas after every third digit.
        theX = "<div>" +
          curX +
          ": " +
          parseFloat(data[curX]).toLocaleString("en") +
          "</div>";
      }
      // Display whats captured.
      return theState + theX + theY;
    });

  // Call toolTip function.
  svg.call(toolTip);

  // Additional functions to help with changing domain and range scale
  
  // Get min and max for domain
  function xMinMax() {
    // Get min
    xMin = d3.min(theData, function(data) {
      return parseFloat(data[curX]) * 0.90;
    });

    // Get max
    xMax = d3.max(theData, function(data) {
      return parseFloat(data[curX]) * 1.10;
    });
  }

  // Get min and max for Range
  function yMinMax() {
    // Get min
    yMin = d3.min(theData, function(data) {
      return parseFloat(data[curY]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    yMax = d3.max(theData, function(data) {
      return parseFloat(data[curY]) * 1.10;
    });
  }

  // Change the classes (and appearance) according to what label
  // has been selected.
  function labelChange(axis, clickedText) {
    // Switch active to inactive.
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the label selected to active.
    clickedText.classed("inactive", false).classed("active", true);
  }

  // Scatter Plot

  // Get min and max values of domain and range.
  xMinMax();
  yMinMax();

  // xScale
  // This tells d3 to place our data points in an area starting after the margin and label area.
  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]); // Account for margin and label area.
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    // Height is inverses due to how d3 calc's y-axis placement
    .range([height - margin - labelArea, margin]); // Account for margin and label area.

  // Pass the scales into the axis methods to create the axes.
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Set number of x and y ticks according to width
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  // Append the axes in group elements.
  // The transform attribute specifies where to place the axes.
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  // Group data points and labels.
  var theCircles = svg.selectAll("g theCircles").data(theData).enter();

  // Append the circles for each row of data.
  theCircles
    .append("circle")
    // These attr's specify location, size and class.
    .attr("cx", function(data) {
      return xScale(data[curX]);
    })
    .attr("cy", function(data) {
      return yScale(data[curY]);
    })
    .attr("r", circRadius)
    .attr("class", function(data) {
      return "stateCircle " + data.abbr;
    })
    // Hover rules
    .on("mouseover", function(data) {
      // Show the tooltip
      toolTip.show(data, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(data) {
      // Remove the tooltip
      toolTip.hide(data);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });

  // State abbreviations from our data and place them in the center of our dots.
  theCircles
    .append("text")
    // We return the abbreviation to .text, which makes the text the abbreviation.
    .text(function(data) {
      return data.abbr;
    })
    // Now place the text using our scale.
    .attr("dx", function(data) {
      return xScale(data[curX]);
    })
    .attr("dy", function(data) {
      // When the size of the text is the radius,
      // adding a third of the radius to the height
      // pushes it into the middle of the circle.
      return yScale(data[curY]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(data) {
      // Show the tooltip
      toolTip.show(data);
      // Highlight the state circle's border
      d3.select("." + data.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(data) {
      // Remove tooltip
      toolTip.hide(data);
      // Remove highlight
      d3.select("." + data.abbr).style("stroke", "#e3e3e3");
    });

  // Make the Graph Dynamic by allow the user to click on any label
  // and display the data it references.

  // Select all axis text and add this d3 click event.
  d3.selectAll(".aText").on("click", function() {
    // Make sure we save a selection of the clicked text,
    // so we can reference it without typing out the invoker each time.
    var self = d3.select(this);

    // We only want to run this on inactive labels.
    // It's a waste of the processor to execute the function
    // if the data is already displayed on the graph.
    if (self.classed("inactive")) {
      // Grab the name and axis saved in label.
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      // When x is the saved axis, execute this:
      if (axis === "x") {
        // Make curX the same as the data name.
        curX = name;

        // Change the min and max of the x-axis
        xMinMax();

        // Update the domain of x.
        xScale.domain([xMin, xMax]);

        // Now use a transition when we update the xAxis.
        svg.select(".xAxis").transition().duration(300).call(xAxis);

        // With the axis changed, let's update the location of the state circles.
        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for it's new attribute.
          // This will lend the circle a motion tween
          // from it's original spot to the new location.
          d3
            .select(this)
            .transition()
            .attr("cx", function(data) {
              return xScale(data[curX]);
            })
            .duration(300);
        });

        // We need change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          // We give each state text the same motion tween as the matching circle.
          d3
            .select(this)
            .transition()
            .attr("dx", function(data) {
              return xScale(data[curX]);
            })
            .duration(300);
        });

        // Finally, change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
      else {
        // When y is the saved axis, execute this:
        // Make curY the same as the data name.
        curY = name;

        // Change the min and max of the y-axis.
        yMinMax();

        // Update the domain of y.
        yScale.domain([yMin, yMax]);

        // Update Y Axis.
        svg.select(".yAxis").transition().duration(300).call(yAxis);

        // With the axis changed, let's update the location of the state circles.
        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for it's new attribute.
          // This will lend the circle a motion tween
          // from it's original spot to the new location.
          d3
            .select(this)
            .transition()
            .attr("cy", function(data) {
              return yScale(data[curY]);
            })
            .duration(300);
        });

        // Change the location of the state texts
        d3.selectAll(".stateText").each(function() {
          // Give each state text the same motion tween as the matching circle.
          d3
            .select(this)
            .transition()
            .attr("dy", function(data) {
              return yScale(data[curY]) + circRadius / 3;
            })
            .duration(300);
        });

        // Change labels
        labelChange(axis, self);
      }
    }
  });


  // Mobile Responsive Code
  // Call a resize function whenever the window dimensions change.
  // This make's it possible to add true mobile-responsiveness to our charts.
  d3.select(window).on("resize", resize);

  // One caveat: we need to specify what specific parts of the chart need size and position changes.
  function resize() {
    // Redefine the width, height and leftTextY (the three variables dependent on the width of the window).
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 3.9;
    leftTextY = (height + labelArea) / 2 - labelArea;

    // Apply the width and height to the svg canvas.
    svg.attr("width", width).attr("height", height);

    // Change the xScale and yScale ranges
    xScale.range([margin + labelArea, width - margin]);
    yScale.range([height - margin - labelArea, margin]);

    // With the scales changes, update the axes (and the height of the x-axis)
    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

    svg.select(".yAxis").call(yAxis);

    // Update the ticks on each axis.
    tickCount();

    // Update the labels.
    xTextRefresh();
    yTextRefresh();

    // Update the radius of each dot.
    crGet();

    // With the axis changed, let's update the location and radius of the state circles.
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[curY]);
      })
      .attr("cx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", function() {
        return circRadius;
      });

    // We need change the location and size of the state texts, too.
    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[curY]) + circRadius / 3;
      })
      .attr("dx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", circRadius / 3);
  }
}
