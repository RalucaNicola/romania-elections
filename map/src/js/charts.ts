import { GraphicAttributes, PartyAttributes } from "./types";
import partyCodes from "./partyCodes";
import * as d3 from "d3";
import CSVLayerView from 'esri/views/layers/CSVLayerView';
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';
import FeatureEffect from 'esri/views/layers/support/FeatureEffect';
let totalResult: GraphicAttributes;

function _createInfoChart(attributes: GraphicAttributes) {
  const data = _getData(attributes);
  const totalVotes = _getTotal(attributes);
  d3.select("#results-chart").html("");

  const barWidth = 50;
  const width = (7 * barWidth);
  const height = 150;
  const verticalMargin = 20;
  const marginRight = 10;
  const chartHeight = height - verticalMargin;
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  const y = d3.scaleLinear()
    .range([chartHeight, verticalMargin])
    .domain([0, d3.max(data, (d: any) => d.value)]);
  const x = d3.scaleBand()
    .domain(data.map(e => { return e.name; }))
    .range([0, width]);
  const xAxis = d3.axisBottom(x);
  const chart = d3.select("#results-chart").append("svg")
    .attr("width", width + marginRight)
    .attr("height", height);
  const bar = chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", (d, i: number) => { return "translate(" + (i * barWidth + barWidth / 8).toString() + ",0)"; });
  bar.append("rect")
    .attr("y", d => { return y(d.value); })
    .attr("height", d => { return chartHeight - y(d.value); })
    .attr("width", barWidth - barWidth / 4)
    .attr("fill", d => { return d.color; })
    .on("mousemove", (d, i: number) => {
      tooltip.transition()
        .duration(100)
        .style("opacity", .9)
        .style("display", "inherit");
      tooltip.html(d.value.toLocaleString() + " votes")
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 30) + "px");
    })
    .on("mouseout", (d, i: number) => {
      tooltip.transition()
        .duration(300)
        .style("opacity", 0)
        .style("display", "none");

    });
  bar.append("text")
    .attr("x", 1)
    .attr("y", d => { return y(d.value) - 15; })
    .attr("dy", ".75em")
    .text(d => { return (d.value / totalVotes * 100).toFixed(2).toString() + "%"; });
  chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(xAxis);
}

function _getData(attr: GraphicAttributes) {

  return partyCodes.map((e: PartyAttributes) => {
    e.value = attr[e.field];
    return e;
  });
}

function _getTotal(attr: GraphicAttributes) {
  let totalAttr = 0;
  for (let i = 1; i <= 16; i++) {
    totalAttr += attr["g" + i.toString()];
  }
  return totalAttr;
}

function createLegend(layerView: CSVLayerView) {
  const marginTop = 20;
  const marginLeft = 10;
  const legend = d3.select("#legend");
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
    .attr("transform", _ => { return "translate(" + marginLeft + "," + marginTop.toString() + ")"; });

  bar.append("rect")
    .attr("y", (d, i: number) => { return barSpacing + i * (barHeight + barSpacing); })
    .attr("height", barHeight)
    .attr("width", barWidth)
    .attr("fill", (d, i: number) => { return _getGradientColor(d.color, hueLegend, i); })
    .on("mouseover", d => {
      layerView.effect = new FeatureEffect({
        filter: new FeatureFilter({
          where: "pred_party = '" + d.field + "'"
        }),
        excludedEffect: "grayscale(100%) opacity(20%)"
      });
    })
    .on("mouseout", _ => layerView.effect = new FeatureEffect());

  bar.append("text")
    .attr("x", barWidth + (barSpacing * 3))
    .attr("y", (d, i: number) => { return (i + 1) * (barHeight + barSpacing) - barSpacing; })
    .text(d => {
      return d.name;
    });
  hueLegend.append("text")
    .attr("x", marginLeft + barWidth + 25)
    .attr("y", marginTop - 5)
    .text(" - dominant party votes in %")
    .attr("fill", "rgb(100, 100, 100)");
  _generateGuide(hueLegend, "40%", marginLeft, marginTop, marginLeft, marginTop + 7 * (barHeight + barSpacing));
  _generateGuide(hueLegend, "70%", marginLeft + barWidth, marginTop, marginLeft + barWidth, marginTop + 7 * (barHeight + barSpacing));
  const sizeLegend = hueLegend.append("g")
    .attr("transform", (d, i: number) => { return "translate(" + marginLeft.toString() + "," + (2.5 * marginTop + 7 * (barHeight + barSpacing)).toString() + ")"; });
  sizeLegend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text("Number of votes for the dominant party")
    .attr("fill", "rgb(100, 100, 100)");
  _generateCircleGroup(sizeLegend, " < 100 votes", 5);
  _generateCircleGroup(sizeLegend, " 8000 votes", 13);
  _generateCircleGroup(sizeLegend, " > 15000 votes", 20);
}

function _generateCircleGroup(sizeLegend: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  text: string,
  radius: number) {
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
function _generateGuide(container: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, percentage: string, x1: number, y1: number, x2: number, y2: number) {
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

function _getGradientColor(color: string, hueLegend: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, i: number) {
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

function initializeTotalCharts(data: Array<GraphicAttributes>) {
  let diaspora = data.filter((e: GraphicAttributes) => e.type === "Diaspora")[0];
  let diasporaBtn = document.getElementById("results-diaspora-btn") as HTMLElement
  diasporaBtn.addEventListener("click", _ => {
    _selectButton("results-diaspora-btn");
    _createInfoChart(diaspora);
  });
  totalResult = data.filter((e: GraphicAttributes) => e.type === "Total")[0];
  let totalBtn = document.getElementById("results-total-btn") as HTMLElement
  totalBtn.addEventListener("click", _ => {
    _selectButton("results-total-btn");
    _createInfoChart(totalResult);
  });
  _selectButton("results-total-btn");
  _createInfoChart(totalResult);
}

function createSelectionChart(attributes: GraphicAttributes) {
  const btn = document.getElementById("results-selection-btn") as HTMLElement;
  btn.innerHTML = attributes.name + ", " + attributes.county;
  btn.style.display = "inline";
  btn.addEventListener("click", _ => _createInfoChart(attributes));
  _selectButton("results-selection-btn");
  _createInfoChart(attributes);
}

function removeSelectionChart() {
  _createInfoChart(totalResult);
  _selectButton("results-total-btn");
  (document.getElementById("results-selection-btn") as HTMLElement).style.display = "none";
}

function _selectButton(id: string) {
  let buttons = (document.getElementById("results-menu") as HTMLElement).getElementsByTagName("button");
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].id === id) {
      buttons[i].classList.add("selected");
    }
    else {
      buttons[i].classList.remove("selected");
    }
  }

}

export default {
  createLegend,
  initializeTotalCharts,
  createSelectionChart,
  removeSelectionChart
};
