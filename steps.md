## Idea

Create a much more detailed elections map of Romania.

## Get data

- [geo-spatial.org vector datasets](http://www.geo-spatial.org/download/romania-seturi-vectoriale) for all Romanian administrative units
- [BEC final results European Parliament elections 2019](https://prezenta.bec.ro/europarlamentare26052019/romania-pv-final)

## Processing

**Spatial dataset (SD)** -> original-data/ro_uat_poligon

**Elections dataset (ED)** -> original-data/pv_RO_EUP_FINAL.csv

**Goal** - merge election results in the spatial dataset so that we can display them on a map

**Step 1.** Convert administrative units from polygons to centroids

Use FeatureToPoint tool in ArcGIS Pro.

**Step 2.** Convert coordinates to Latitude Longitude and save them as new fields in the attribute table.

Use Project tool in ArcGIS Pro and then Add new field -> Calculate geometry.

**Step 3.** Export attribute table to csv

Use Export to Table to convert it to csv for further processing in pandas.

**Step 4.** Group party votes values (gx) by administrative units + county (you can have the same admin unit name in different counties)

```
g_ed = ed.groupby(by = ["Uat", "Județ"]).agg({"g1": "sum", "g2": "sum", "g3": "sum", "g4": "sum", "g5": "sum", "g6": "sum", "g7": "sum", "g8": "sum", "g9": "sum", "g10": "sum", "g11": "sum", "g12": "sum", "g13": "sum", "g14": "sum", "g15": "sum", "g16": "sum"}).reset_index()

```

**Step 5.** Prepare for merge: copy the field with the name and replace all diacritics and special characters

```
g_ed["name_uat"] = (g_ed["Uat"] + g_ed["Județ"]).transform(lambda s: s.replace(" ", "").replace("-", "").replace('MUNICIPIUL', '').replace('COMUNA', '').replace('ORAŞ', '').replace("Ă", "A").replace("Ţ", "T").replace("Ă", "A").replace("Ş", "S").replace("Â", "I").replace("Î", "I").lower())
sd["name_uat"] = (sd["name"] + sd["county"]).transform(lambda s: s.lower().replace(" ", "").replace("-", "").replace("ă", "a").replace("ț", "t").replace("ă", "a").replace("ș", "s").replace("â", "i").replace("î", "i"))
```

**Step 6.** Some cities still have different names, so we overwrite them manually

```
def replaceName(old, new):
  g_ed.at[g_ed[g_ed["name_uat"] == old].index.values.astype(int)[0], "name_uat"] = new

replaceName("hirseștiarges", "hirsestiarges");
replaceName("lungasudejosbihor", "lugasudejosbihor");
replaceName("movrodinteleorman", "mavrodinteleorman");
replaceName("simbatadesusbrasov", "sambatadesusbrasov");
replaceName("sinnicolaurominbihor", "sannicolauromanbihor");
replaceName("unousatumare", "orasunousatumare");
```

**Step 7.** Merge datasets based on the new id created by combining county name and admin unit name.

```
merged = g_ed.merge(sd,
    left_on = "name_uat",
    right_on = "name_uat",
    how="outer")
```

**Step 8.** Add new fields where we calculate the predominant party, and its percentage and absolute values:

```
columns = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "g10", "g11", "g12", "g13", "g14", "g15", "g16"]

merged["pred_absolute"] = merged[columns].max(axis=1)
merged["pred_percent"] = round(merged[columns].max(axis=1)/merged[columns].sum(axis=1) * 100, 2)
merged["pred_party"] = merged[columns].idxmax(axis=1)
```

See the whole script at [processing.py](./data-processing/processing.py)

## Visualization with ArcGIS API for JavaScript