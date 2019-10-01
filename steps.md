## Idea

Create a much more detailed elections map of Romania.

## Get data

- [geo-spatial.org vector datasets](http://www.geo-spatial.org/download/romania-seturi-vectoriale) for all Romanian administrative units
- [BEC final results European Parliament elections 2019](https://prezenta.bec.ro/europarlamentare26052019/romania-pv-final)

## Processing

Spatial dataset (SD) -> original-data/ro_uat_poligon
Elections dataset (ED) -> original-data/pv_RO_EUP_FINAL.csv

Goal - merge election results in the spatial dataset so that we can display them on a map

Step 1. Convert UAT polygons to centroids

Use FeatureToPoint tool in ArcGIS Pro.

Step 2. Convert coordinates to Latitude Longitude and save them as fields.
Use Project tool in ArcGIS Pro and then Add new field -> Calculate geometry.

Step 3. Use Export to Table to convert it to csv for further processing in pandas.

Step 4. Group values by admin units
