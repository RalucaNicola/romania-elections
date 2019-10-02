
import { GraphicAttributes } from "./types";
import partyCodes from "./partyCodes";
declare var d3: any;

function createInfoChart(attributes: GraphicAttributes) {
  const data = _getData(attributes);
  const total = _getTotal(attributes);

  const barWidth = 45;
  const width = 350;
  const height = 150;
  const margin = 30;
  const chartHeight = height - margin;
  d3.select("#results").html("");
  d3.select("#results").append("div").html(attributes.name + ", " + attributes.county);
  const div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  const y = d3.scaleLinear()
    .range([chartHeight, margin])
    .domain([0, d3.max(data, function (d: any) { return d.value; })]);
  const x = d3.scaleBand()
    .domain(data.map(function (e) { return e.name; }))
    .range([0, width - margin]);
  const xAxis = d3.axisBottom(x);
  const chart = d3.select("#results").append("svg")
    .attr("width", width)
    .attr("height", height);
  const bar = chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function (d: any, i: number) { return "translate(" + (i * barWidth + 5).toString() + ",0)"; });
  bar.append("rect")
    .attr("y", function (d: any) { return y(d.value); })
    .attr("height", function (d: any) { return chartHeight - y(d.value); })
    .attr("width", barWidth - 10)
    .attr("fill", function (d: any) { return d.color; })
    .on("mousemove", function (d: any, i: number) {
      div.transition()
        .duration(100)
        .style("opacity", .9);
      div.html(" " + d.value.toString() + " votes ")
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 20) + "px");
    })
    .on("mouseout", function (d: any, i: number) {
      div.transition()
        .duration(300)
        .style("opacity", 0);

    });
  bar.append("text")
    .attr("x", 1)
    .attr("y", function (d: any) { return y(d.value) - 15; })
    .attr("dy", ".75em")
    .text(function (d: any) { return (d.value / total * 100).toFixed(1).toString() + "%"; });
  chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(xAxis);
}

function _getData(attr: GraphicAttributes) {

  return partyCodes.map(function (e: any) {
    e.value = attr[e.field];
    return e;
  });
}

function _getTotal(attr: GraphicAttributes) {
  let total = 0;
  for (let i = 1; i <= 16; i++) {
    total += attr["g" + i.toString()];
  }
  return total;
}

function createLegend(layerView: any) {
  const marginTop = 20;
  const marginLeft = 10;
  const legend = d3.select("#legend");
  legend.append("div").html("<h3>European Parliament Elections 2019 Results in Romania");
  const width = 280;
  const height = 300;
  const barHeight = 20;
  const barWidth = 70;
  const barSpacing = 5;
  const hueLegend = legend.append("svg")
    .attr("width", width)
    .attr("height", height);
  const bar = hueLegend.selectAll("g")
    .data(partyCodes)
    .enter().append("g")
    .attr("transform", function (d: any, i: number) { return "translate(" + marginLeft + "," + marginTop.toString() + ")"; });

  bar.append("rect")
    .attr("y", function (d: any, i: number) { return barSpacing + i * (barHeight + barSpacing); })
    .attr("height", barHeight)
    .attr("width", barWidth)
    .attr("fill", function (d: any, i: number) { return _getGradientColor(d.color, hueLegend, i); })
    .on("mouseover", function (d: any) {
      layerView.effect = {
        filter: {
          where: "pred_party = '" + d.field + "'"
        },
        excludedEffect: "grayscale(100%) opacity(20%)"
      };
    })
    .on("mouseout", function (d: any) {
      layerView.effect = null;
    });

  bar.append("text")
    .attr("x", barWidth + (barSpacing * 3))
    .attr("y", function (d: any, i: number) { return (i + 1) * (barHeight + barSpacing) - barSpacing; })
    .text(function (d: any) {
      return d.name;
    });
  hueLegend.append("text")
    .attr("x", marginLeft + barWidth + 25)
    .attr("y", marginTop - 5)
    .text(" - dominant party votes in %")
    .attr("fill", "rgb(100, 100, 100)");
  _generateGuide(hueLegend, "40%", marginLeft, marginTop, marginLeft, marginTop + 7 * (barHeight + barSpacing));
  _generateGuide(hueLegend, "80%", marginLeft + barWidth, marginTop, marginLeft + barWidth, marginTop + 7 * (barHeight + barSpacing));
  const sizeLegend = hueLegend.append("g")
    .attr("transform", function (d: any, i: number) { return "translate(" + marginLeft.toString() + "," + (2.5 * marginTop + 7 * (barHeight + barSpacing)).toString() + ")"; });
  sizeLegend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text("Number of votes for the dominant party")
    .attr("fill", "rgb(100, 100, 100)");
  _generateCircleGroup(sizeLegend, " < 100 votes", 5);
  _generateCircleGroup(sizeLegend, " 8000 votes", 13);
  _generateCircleGroup(sizeLegend, " > 15000 votes", 20);
}

function _generateCircleGroup(sizeLegend: any, text: string, radius: number) {
  const top = 60;
  const container = sizeLegend.append("g");
  container.append("circle")
    .attr("r", radius)
    .attr("cx", 30)
    .attr("cy", top - radius)
    .attr("fill", "transparent")
    .attr("stroke", "black");
  container.append("line")
    .attr("x1", 30)
    .attr("y1", top - (2 * radius))
    .attr("x2", 80)
    .attr("y2", top - (2 * radius))
    .attr("stroke", "rgb(100, 100, 100)")
    .attr("stroke-dasharray", "5");
  container.append("text")
    .attr("x", 85)
    .attr("y", top - (2 * radius) + 5)
    .text(text)
    .attr("fill", "rgb(100, 100, 100)");
}
function _generateGuide(container: any, percentage: string, x1: number, y1: number, x2: number, y2: number) {
  container.append("text")
    .attr("x", x1 + 5)
    .attr("y", y1 - 5)
    .text(percentage)
    .attr("fill", "rgb(100, 100, 100)")
    .attr("text-anchor", "middle");
  container.append("line")
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2)
    .attr("stroke", "rgb(150, 150, 150)")
    .attr("stroke-dasharray", "5");
}

function _getGradientColor(color: string, hueLegend: any, i: number) {
  const linearGradient = hueLegend.append("defs").append("linearGradient");
  linearGradient.attr("id", "i-" + i.toString());
  linearGradient.append("stop")
    .attr("offset", "0%")
    .style("stop-color", color)
    .style("stop-opacity", "0.2");
  linearGradient.append("stop")
    .attr("offset", "100%")
    .style("stop-color", color)
    .style("stop-opacity", "1.0");
  return "url(#i-" + i.toString() + ")";
}

function generateTotalResults() {
  createInfoChart({
    g1: 2031585,
    g2: 1861655,
    g3: 574408,
    g4: 473062,
    g5: 2327988,
    g6: 368338,
    g7: 51850,
    g8: 492099,
    g9: 38601,
    g10: 25753,
    g11: 48889,
    g12: 52696,
    g13: 19646,
    g14: 96721,
    g15: 104820,
    g16: 122245,
    name: "Total votes",
    county: "Romania",
    pred_absolute: 0,
    pred_party: "None",
    pred_percent: 0
  });
}

export default {
  createInfoChart,
  createLegend,
  generateTotalResults
};
