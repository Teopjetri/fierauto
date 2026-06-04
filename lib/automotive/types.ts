export interface YearRange {
  from: number;
  to: number;
}

export interface AutomotiveModel {
  name: string;
  ranges: YearRange[];
}

export interface AutomotiveBrand {
  name: string;
  models: AutomotiveModel[];
}

export const FUEL_OPTIONS = [
  "Benzina",
  "Diesel",
  "Hybrid",
  "Plug-In Hybrid",
  "GPL",
  "Metano",
  "Elettrica",
] as const;

export type FuelOption = (typeof FUEL_OPTIONS)[number];
