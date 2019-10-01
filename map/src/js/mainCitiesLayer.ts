import CSVLayer from "esri/layers/CSVLayer";
import SimpleRenderer from "esri/renderers/SimpleRenderer";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import LabelClass from "esri/layers/support/LabelClass";
import { TextSymbol } from "esri/symbols";

export default new CSVLayer({
  url: "./data/cities_ro.csv",
  renderer: new SimpleRenderer({
    symbol: new SimpleMarkerSymbol({
      size: 2,
      color: [0, 0, 0, 0.3],
      outline: {
        width: 0
      }
    })
  }),
  labelsVisible: true,
  labelingInfo: [
    new LabelClass({
      labelExpressionInfo: { expression: "$feature.city" },
      symbol: new TextSymbol({
        font: {
          size: 11,
          family: "Avenir Next LT Pro",
          style: "normal",
          weight: "normal"
        },
        yoffset: -5,
        color: [20, 20, 20],
        haloSize: 1,
        haloColor: [255, 255, 255, 0.5]
      }),
      labelPlacement: "above-center",
      where: "population > 150000"
    }),
    new LabelClass({
      labelExpressionInfo: { expression: "$feature.city" },
      symbol: new TextSymbol({
        font: {
          size: 10,
          family: "Avenir Next LT Pro",
          style: "normal",
          weight: "normal"
        },
        yoffset: -5,
        color: [50, 50, 50],
        haloSize: 1,
        haloColor: [255, 255, 255, 0.5]
      }),
      labelPlacement: "above-center",
      where: "population <= 150000"
    })
  ]
});
