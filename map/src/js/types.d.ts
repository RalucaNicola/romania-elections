
export interface GraphicAttributes {
  g1: number;
  g2: number;
  g3: number;
  g4: number;
  g5: number;
  g6: number;
  g7: number;
  g8: number;
  g9: number;
  g10: number;
  g11: number;
  g12: number;
  g13: number;
  g14: number;
  name: string;
  county: string;
  pred_absolute: number;
  pred_party: string;
  pred_percent: number;
  type: "Diaspora" | "Total";
}

export interface PartyAttributes {
  name: string;
  field: string;
  color: string;
  value: number;
}