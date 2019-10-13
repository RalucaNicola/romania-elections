import pandas as pd

'''
Part 1. Read in spatial dataset and election results
'''

url_original = r"/Library/WebServer/Documents/romania-elections/original-data/"
url_processed = r"/Library/WebServer/Documents/romania-elections/map/data/"

# spatial dataset - centroids of administrative units
spatial_df = pd.read_csv(url_original + "ro_uat_point.csv", usecols=["name", "county", "Longitude", "Latitude"])

# election dataset - results from election
columns = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "g10", "g11", "g12", "g13", "g14", "g15", "g16"]
elect_df = pd.read_csv(url_original + "pv_RO_EUP_FINAL.csv", usecols=["Județ", "Uat"] + columns)

'''
Part 2. Prepare data for merge:
 - group the results by administrative unit
 - create new columns by joining uat name and county (to have a unique uat)
 - remove special signs and replace diacritics
 - sort dataframe by the new column (uat and county)
 - find the names that don't match and manually correct them
'''


# group results from election by admin units - 3185 admin units after grouping
sum_parties = {col: "sum" for col in columns}
elect_df = elect_df.groupby(by=["Uat", "Județ"]).agg(sum_parties).reset_index()

# transform data in both columns to make them match (remove all spaces/slashes/diacritic letters)

# duplicate column to keep not mess up the original name
elect_df["name_uat"] = (elect_df["Uat"] + elect_df["Județ"]).transform(lambda s: s.replace(" ", "").replace("-", "").replace('MUNICIPIUL', '').replace('COMUNA', '').replace('ORAŞ', '').replace("Ă", "A").replace("Ţ", "T").replace("Ă", "A").replace("Ş", "S").replace("Â", "I").replace("Î", "I").lower())
spatial_df["name_uat"] = (spatial_df["name"] + spatial_df["county"]).transform(lambda s: s.lower().replace(" ", "").replace("-", "").replace("ă", "a").replace("ț", "t").replace("ă", "a").replace("ș", "s").replace("â", "i").replace("î", "i"))

elect_df = elect_df.sort_values("name_uat")
spatial_df = spatial_df.sort_values("name_uat")

# data that needs manual correction (see fuzzywuzzy script at the bottom of the page)
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

'''
Part 3. Merge data and calculate new columns for each uat
 - calculate predominant party
 - calculate predominant party percentage
 - calculate predominant party absolute number of votes
'''

merged = elect_df.merge(spatial_df, left_on = "name_uat", right_on = "name_uat", how="outer")

# calculate new columns needed for the visualization
merged["pred_absolute"] = merged[columns].max(axis=1)
merged["pred_percent"] = round(merged[columns].max(axis=1)/merged[columns].sum(axis=1) * 100, 2)
merged["pred_party"] = merged[columns].idxmax(axis=1)

# delete columns that aren't needed anymore
merged = merged.drop(labels=["name_uat", "Județ", "Uat"], axis=1)

# export data to csv to use it in the map
merged.to_csv(path_or_buf=url_processed + "election_uat_final.csv", index_label="object_id")

'''
Part 4. Prepare data for total results for romania and diaspora
 - load diaspora election results
 - calculate totals
 - export to csv file
'''

ed_abroad = pd.read_csv(url_original + "pv_SR_EUP_FINAL.csv", usecols=columns)

# calculate totals for abroad
total_abroad = ed_abroad.agg(sum_parties)
total_abroad["type"] = "Diaspora"

# calculate totals for Romania
select_merge = merged[columns]
total_ro = select_merge.agg(sum_parties)
total_ro["type"] = "Romania"

# calculate final results by adding diaspora votes and votes inside the country
final = pd.DataFrame(columns=["type"] + columns)
final = final.append(total_abroad, ignore_index=True).append(total_ro, ignore_index=True)
total = final.agg("sum")
total["type"] = "Total"
final = final.append(total, ignore_index=True)

# save results to a csv file
final.to_json(path_or_buf=url_processed + "election_total_results.json", orient="records")


'''
# before I merged, I made a test to see which names don't match 100%
# these need manual correction - I replaced the value in one of the
# files with the value in the other file

from fuzzywuzzy import fuzz

def match_name(name, list_names, min_score=0):
    # -1 score incase we don't get any matches
    max_score = -1
    # Returning empty name for no match as well
    max_name = ""
    # Iternating over all names in the other
    for name2 in list_names:
        #Finding fuzzy match score
        score = fuzz.ratio(name, name2)
        # Checking if we are above our threshold and have a better score
        if (score > min_score) & (score > max_score):
            max_name = name2
            max_score = score
    return [max_name, max_score]


for name in elect_df["name_uat"].to_list():
    match = match_name(name, spatial_df['name_uat'].to_list())
    if (match[1] < 100):
        print(name, match[0], match[1], name == match[0])

## results

bucurestisector1 bucurestisectorul1bucuresti 74 False
bucurestisector2 bucurestisectorul2bucuresti 74 False
bucurestisector3 bucurestisectorul3bucuresti 74 False
bucurestisector4 bucurestisectorul4bucuresti 74 False
bucurestisector5 bucurestisectorul5bucuresti 74 False
bucurestisector6 bucurestisectorul6bucuresti 74 False
hirseștiarges hirsestiarges 92 False
lungasudejosbihor lugasudejosbihor 97 False
movrodinteleorman mavrodinteleorman 94 False
simbatadesusbrasov sambatadesusbrasov 94 False
sinnicolaurominbihor sannicolauromanbihor 90 False
unousatumare orasunousatumare 86 False

'''

