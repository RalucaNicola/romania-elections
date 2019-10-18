## Data Processing Steps

**Data**

Spatial dataset -> original-data/ro_uat_poligon

Elections dataset Romania -> original-data/pv_RO_EUP_FINAL.csv

**Goal** - merge election results in the spatial dataset so that we can display them on a map

**Step 1.** Convert administrative units from polygons to centroids

I used FeatureToPoint tool in ArcGIS Pro.

**Step 2.** Convert coordinates to Latitude Longitude and save them as new fields in the attribute table.

I used Project tool in ArcGIS Pro and then Add new field -> Calculate geometry.

**Step 3.** Export attribute table to csv

Use Export to Table to convert it to csv for further processing in pandas.

**Step 4.** Group party votes values (gx) by administrative units + county (like this we obtain unique keys - there could be the same admin unit name in different counties)

```py
columns = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "g10", "g11", "g12", "g13", "g14", "g15", "g16"]
sum_parties = {col: "sum" for col in columns}
elect_df = elect_df.groupby(by=["Uat", "Județ"]).agg(sum_parties).reset_index()
```

**Step 5.** Prepare for merge: copy the field with the name and replace all diacritics and special characters

```py
elect_df["name_uat"] = (elect_df["Uat"] + elect_df["Județ"]).transform(lambda s: s.replace(" ", "").replace("-", "").replace('MUNICIPIUL', '').replace('COMUNA', '').replace('ORAŞ', '').replace("Ă", "A").replace("Ţ", "T").replace("Ă", "A").replace("Ş", "S").replace("Â", "I").replace("Î", "I").lower())

spatial_df["name_uat"] = (spatial_df["name"] + spatial_df["county"]).transform(lambda s: s.lower().replace(" ", "").replace("-", "").replace("ă", "a").replace("ț", "t").replace("ă", "a").replace("ș", "s").replace("â", "i").replace("î", "i"))
```

**Step 6.** Some cities still have different names, so we overwrite them manually

```py
def replaceName(old, new):
  elect_df.at[elect_df[elect_df["name_uat"] == old].index.values.astype(int)[0], "name_uat"] = new

replaceName("hirseștiarges", "hirsestiarges")
replaceName("lungasudejosbihor", "lugasudejosbihor")
replaceName("movrodinteleorman", "mavrodinteleorman")
replaceName("simbatadesusbrasov", "sambatadesusbrasov")
replaceName("sinnicolaurominbihor", "sannicolauromanbihor")
replaceName("unousatumare", "orasunousatumare")

for i in range(1, 7):
  replaceName("bucurestisector" + str(i), "bucurestisectorul" + str(i) + "bucuresti")
```

**Step 7.** Merge datasets based on the new id created by combining county name and admin unit name.

```py
merged = elect_df.merge(spatial_df, left_on = "name_uat", right_on = "name_uat", how="outer")
```

**Step 8.** Add new fields where we calculate the predominant party, and its percentage and absolute values:

```py
columns = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "g10", "g11", "g12", "g13", "g14", "g15", "g16"]

merged["pred_absolute"] = merged[columns].max(axis=1)
merged["pred_percent"] = round(merged[columns].max(axis=1)/merged[columns].sum(axis=1) * 100, 2)
merged["pred_party"] = merged[columns].idxmax(axis=1)
```

See the whole script at [processing.py](./processing.py)
