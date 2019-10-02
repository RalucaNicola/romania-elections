import Map from "esri/Map";
import MapView from "esri/views/MapView";
import TileLayer from "esri/layers/TileLayer";
import Basemap from "esri/Basemap";
import VectorTileLayer from "esri/layers/VectorTileLayer";

import mainCitiesLayer from "./mainCitiesLayer";
import electionLayer from "./electionLayer";

import charts from "./charts";
import Expand from "esri/widgets/Expand";


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

const hillshadeLayer = new TileLayer({
  url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
  opacity: 1
});

const countryBorders = new VectorTileLayer({
  url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer"
});

countryBorders.loadStyle("./data/borders_style.json");

const map = new Map({
  basemap: new Basemap({
    baseLayers: [hillshadeLayer, countryBorders, countiesLayer, municipalitiesLayer]
  })
});

const mapView = new MapView({
  map: map,
  container: "viewDiv",
  center: [24.62, 45.76],
  zoom: 7,
  spatialReference: {
    wkid: 3857
  },
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
        charts.createInfoChart(graphic.attributes);
      }
    } else {
      removeHighlight();
      charts.generateTotalResults();
    }
  }).catch(console.error);

});

charts.generateTotalResults();


lyrViewPromise.then(lyrView => charts.createLegend(lyrView));

function removeHighlight() {
  if (highlight) {
    highlight.remove();
    highlight = null;
  }
}

mapView.ui.add("results", "bottom-right");
const expandWidget = new Expand({
  view: mapView,
  content: document.getElementById("legend"),
  expanded: true
});
mapView.ui.add(expandWidget, "top-right");
