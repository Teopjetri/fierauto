import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../data/automotive/source.txt"), "utf-8");

function parseYearRanges(yearStr) {
  const ranges = [];
  const parts = yearStr.split(",").map((s) => s.trim());
  for (const part of parts) {
    const cleaned = part.replace(/\s+in\s+China.*$/i, "").trim();
    const m = cleaned.match(/(\d{4})(?:\s*-\s*(\d{4}))?/);
    if (!m) continue;
    const from = parseInt(m[1], 10);
    const to = parseInt(m[2] || m[1], 10);
    if (from >= 1990 && from <= 2026) {
      ranges.push({ from, to: Math.min(to, 2026) });
    }
  }
  return ranges;
}

function parseModels(modelsStr) {
  const models = [];
  const regex = /([^,]+?)\s*\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(modelsStr)) !== null) {
    const name = match[1].trim();
    const ranges = parseYearRanges(match[2]);
    if (name && ranges.length) {
      models.push({ name, ranges });
    }
  }
  return models;
}

const catalog = [];

for (const line of source.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("•")) continue;

  const content = trimmed.slice(1).trim();
  const colonIdx = content.indexOf(":");
  if (colonIdx < 0) continue;

  const brandName = content.slice(0, colonIdx).trim();
  const modelsStr = content.slice(colonIdx + 1).trim();
  const models = parseModels(modelsStr);

  if (brandName && models.length) {
    catalog.push({ name: brandName, models });
  }
}

catalog.sort((a, b) => a.name.localeCompare(b.name, "it"));

const outPath = path.join(__dirname, "../data/automotive/catalog.json");
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2));

const brandCount = catalog.length;
const modelCount = catalog.reduce((a, b) => a + b.models.length, 0);
console.log(`Catalog: ${brandCount} brands, ${modelCount} models → ${outPath}`);
