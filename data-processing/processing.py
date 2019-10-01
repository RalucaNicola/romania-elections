import pandas as pd
import numpy as np

url = r"C:/dev/demo-apps/romania-elections/data-processing/"
# spatial dataset - centroids of administrative units
sd = pd.read_csv(url + "ro_uat_point.csv", usecols = ["name", "county", "Longitude", "Latitude"])
# election dataset - results from election
ed = pd.read_csv(url + "pv_RO_EUP_FINAL.csv", usecols = ["Județ", "Uat", "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "g10", "g11", "g12", "g13", "g14", "g15", "g16"])

# group results from election by admin units - 3185 admin units after grouping
g_ed = ed.groupby(by = ["Uat", "Județ"]).agg({"g1": "sum", "g2": "sum", "g3": "sum", "g4": "sum", "g5": "sum", "g6": "sum", "g7": "sum", "g8": "sum", "g9": "sum", "g10": "sum", "g11": "sum", "g12": "sum", "g13": "sum", "g14": "sum", "g15": "sum", "g16": "sum"}).reset_index()

# transform data in both columns to make them match (remove all spaces/slashes/diacritic letters

# duplicate column to keep not mess up the original name
g_ed["name_uat"] = (g_ed["Uat"] + g_ed["Județ"]).transform(lambda s: s.replace(" ", "").replace("-", "").replace('MUNICIPIUL', '').replace('COMUNA', '').replace('ORAŞ', '').replace("Ă", "A").replace("Ţ", "T").replace("Ă", "A").replace("Ş", "S").replace("Â", "I").replace("Î", "I").lower())
sd["name_uat"] = (sd["name"] + sd["county"]).transform(lambda s: s.lower().replace(" ", "").replace("-", "").replace("ă", "a").replace("ț", "t").replace("ă", "a").replace("ș", "s").replace("â", "i").replace("î", "i"))

g_ed = g_ed.sort_values("name_uat")
sd = sd.sort_values("name_uat")


g_ed.at[g_ed[g_ed["name_uat"] == "bucurestisector1"].index.values.astype(int)[0], "name_uat"] = "bucurestisectorul1bucuresti"
g_ed.at[g_ed[g_ed["name_uat"] == "bucurestisector2"].index.values.astype(int)[0], "name_uat"] = "bucurestisectorul2bucuresti"
g_ed.at[g_ed[g_ed["name_uat"] == "bucurestisector3"].index.values.astype(int)[0], "name_uat"] = "bucurestisectorul3bucuresti"
g_ed.at[g_ed[g_ed["name_uat"] == "bucurestisector4"].index.values.astype(int)[0], "name_uat"] = "bucurestisectorul4bucuresti"
g_ed.at[g_ed[g_ed["name_uat"] == "bucurestisector5"].index.values.astype(int)[0], "name_uat"] = "bucurestisectorul5bucuresti"
g_ed.at[g_ed[g_ed["name_uat"] == "bucurestisector6"].index.values.astype(int)[0], "name_uat"] = "bucurestisectorul6bucuresti"
g_ed.at[g_ed[g_ed["name_uat"] == "hirseștiarges"].index.values.astype(int)[0], "name_uat"] = "hirsestiarges"
g_ed.at[g_ed[g_ed["name_uat"] == "lungasudejosbihor"].index.values.astype(int)[0], "name_uat"] = "lugasudejosbihor"
g_ed.at[g_ed[g_ed["name_uat"] == "movrodinteleorman"].index.values.astype(int)[0], "name_uat"] = "mavrodinteleorman"
g_ed.at[g_ed[g_ed["name_uat"] == "simbatadesusbrasov"].index.values.astype(int)[0], "name_uat"] = "sambatadesusbrasov"
g_ed.at[g_ed[g_ed["name_uat"] == "sinnicolaurominbihor"].index.values.astype(int)[0], "name_uat"] = "sannicolauromanbihor"
g_ed.at[g_ed[g_ed["name_uat"] == "unousatumare"].index.values.astype(int)[0], "name_uat"] = "orasunousatumare"

merged = g_ed.merge(sd,
       left_on = "name_uat",
       right_on = "name_uat",
       how="outer")

party_dict = {
  1: "PSD",
  2: "USR Plus",
  3: "Pro Romania",
  4: "UDMR",
  5: "PNL",
  6: "ALDE",
  7: "Prodemo",
  8: "PMP",
  9: "PSR",
  10: "PSDI",
  11: "PRU",
  12: "UNPR",
  13: "BUN",
  14: "Gregoriana-Carmen Tudoran",
  15: "George-Nicolae Simion",
  16: "Peter Costea"
}

def getParty(*argv):
  max = 0
  party = ''
  for i in range(0, 16):
    if argv[i] >= max:
      max = argv[i]
      party = party_dict[i + 1]
  return party

columns = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "g10", "g11", "g12", "g13", "g14", "g15", "g16"]


merged["pred_absolute"] = merged[columns].max(axis=1)
merged["pred_percent"] = round(merged[columns].max(axis=1)/merged[columns].sum(axis=1) * 100, 2)
merged["pred_party"] = merged[columns].idxmax(axis=1)

del merged["name_uat"]
del merged["Județ"]
del merged["Uat"]

merged["final"] = "a"

print(merged)

merged.to_csv(url + "election_uat_final.csv")


'''
# before we merge, we make a test to see which names don't match 100%
# these might need manual correction
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


for name in g_ed["name_uat"].to_list():
    match = match_name(name, sd['name_uat'].to_list())
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

