import Map from "esri/Map";
import MapView from "esri/views/MapView";
import TileLayer from "esri/layers/TileLayer";
import Basemap from "esri/Basemap";
import VectorTileLayer from "esri/layers/VectorTileLayer";

import mainCitiesLayer from "./mainCitiesLayer";
import electionLayer from "./electionLayer";

import charts from "./charts";
import SpatialReference from "esri/geometry/SpatialReference";

import esriRequest from "esri/request";

let legendVisible = false;

// define base layers
const countiesLayer = new TileLayer({
  url: "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/ro_judete_poligon_tile/MapServer",
  maxScale: 500000
});

const municipalitiesLayer = new TileLayer({
  url: "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/elections_ro_eu_2019_tiles/MapServer",
  maxScale: 100000,
  minScale: 1500000
});

const countryBorders = new VectorTileLayer({
  url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer"
});

countryBorders.loadStyle("./data/borders_style.json");

const hillshadeLayer = new TileLayer({
  url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
  opacity: 0.6
});

const map = new Map({
  basemap: new Basemap({
    baseLayers: [countryBorders, countiesLayer, municipalitiesLayer, hillshadeLayer]
  })
});

const mapView = new MapView({
  map: map,
  container: "viewDiv",
  center: [24.62, 45.76],
  zoom: 6,
  spatialReference: SpatialReference.WebMercator,
  highlightOptions: {
    color: [0, 255, 255],
    fillOpacity: 0
  }
});

map.addMany([electionLayer, mainCitiesLayer]);
const lyrViewPromise = mapView.whenLayerView(electionLayer);
let highlight: any = null;

mapView.on("click", function (event: any) {
  mapView.hitTest(event).then(function (response) {

    if (response.results.length) {
      const result = response.results.filter(function (result) {
        return result.graphic.layer === electionLayer;
      })[0];
      if (result) {
        const graphic = result.graphic;
        removeHighlight();
        lyrViewPromise.then(lyrView => highlight = lyrView.highlight(graphic));
        charts.createSelectionChart(graphic.attributes);
      }
    } else {
      removeHighlight();
      charts.removeSelectionChart();
    }
  }).catch(console.error);

});

esriRequest("./data/election_total_results.json").then(response => {
  charts.initializeTotalCharts(response.data);
}).catch(console.error);

lyrViewPromise.then(lyrView => charts.createLegend(lyrView));

function removeHighlight() {
  if (highlight) {
    highlight.remove();
    highlight = null;
  }
}

mapView.ui.add("results", "bottom-left");
let legendController = document.getElementById("show-legend");
legendController.addEventListener("click", () => {
  document.getElementById("legend").style.display = legendVisible ? "none" : "block";
  legendController.innerHTML = legendVisible ? "Show legend" : "Hide legend";
  legendVisible = !legendVisible;
});
