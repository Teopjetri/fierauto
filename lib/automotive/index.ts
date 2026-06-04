import catalogData from "@/data/automotive/catalog.json";
import type { AutomotiveBrand, AutomotiveModel } from "./types";

const catalog = catalogData as AutomotiveBrand[];

export function getAllBrands(): AutomotiveBrand[] {
  return catalog;
}

export function searchBrands(query: string): AutomotiveBrand[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalog;
  return catalog
    .filter((b) => b.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.name.localeCompare(b.name, "it");
    });
}

export function getBrand(name: string): AutomotiveBrand | undefined {
  return catalog.find((b) => b.name.toLowerCase() === name.toLowerCase());
}

export function getModelsForBrand(brandName: string): AutomotiveModel[] {
  const brand = getBrand(brandName);
  if (!brand) return [];
  return [...brand.models].sort((a, b) => a.name.localeCompare(b.name, "it"));
}

export function getYearsForModel(brandName: string, modelName: string): number[] {
  const brand = getBrand(brandName);
  if (!brand) return [];
  const model = brand.models.find((m) => m.name.toLowerCase() === modelName.toLowerCase());
  if (!model) return [];
  const years = new Set<number>();
  for (const range of model.ranges) {
    for (let y = range.to; y >= range.from; y--) years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

export function isValidCombination(brandName: string, modelName: string, year: string): boolean {
  const years = getYearsForModel(brandName, modelName);
  const y = parseInt(year, 10);
  return years.includes(y);
}
