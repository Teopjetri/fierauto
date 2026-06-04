import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const DATA_DIR = path.join(root, "data", "car-media");

const slugs = [
  "mercedes-classe-s-amg-line-2022",
  "bmw-serie-5-m-sport-2021",
  "audi-a6-s-line-2020",
  "mercedes-glc-coupe-2023",
  "audi-rsq3-2022",
  "bmw-x5-m-sport-2021",
];

await fs.mkdir(DATA_DIR, { recursive: true });

for (const slug of slugs) {
  const file = path.join(DATA_DIR, `${slug}.json`);
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(
      file,
      JSON.stringify({ slug, photos: [], updatedAt: new Date().toISOString() }, null, 2)
    );
  }
}

console.log("Car media manifests ready.");
