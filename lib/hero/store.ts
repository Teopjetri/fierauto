import { promises as fs } from "fs";
import path from "path";

const HERO_DIR = path.join(process.cwd(), "public", "hero");
const HERO_CANDIDATES = ["hero.jpg", "hero.jpeg", "hero.webp", "hero.png"] as const;

function heroPath(filename: string): string {
  return path.join(HERO_DIR, filename);
}

export async function ensureHeroDir(): Promise<void> {
  await fs.mkdir(HERO_DIR, { recursive: true });
}

export async function getHeroImage(): Promise<{ src: string | null; version: number }> {
  await ensureHeroDir();
  for (const name of HERO_CANDIDATES) {
    try {
      const stat = await fs.stat(heroPath(name));
      return { src: `/hero/${name}`, version: stat.mtimeMs || Date.now() };
    } catch {
      /* file assente */
    }
  }
  return { src: null, version: 0 };
}

function normalizeExt(filename: string): ".jpg" | ".webp" {
  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : ".jpg";
  if (ext === ".webp") return ".webp";
  return ".jpg";
}

export async function saveHeroImage(buffer: Buffer, originalName: string): Promise<{ src: string; version: number }> {
  await ensureHeroDir();

  for (const name of HERO_CANDIDATES) {
    try {
      await fs.unlink(heroPath(name));
    } catch {
      /* ignore */
    }
  }

  const ext = normalizeExt(originalName);
  const filename = ext === ".webp" ? "hero.webp" : "hero.jpg";
  const filePath = heroPath(filename);
  await fs.writeFile(filePath, buffer);
  const version = Date.now();

  return { src: `/hero/${filename}`, version };
}
