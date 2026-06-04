import { promises as fs } from "fs";
import path from "path";

const LOGO_DIR = path.join(process.cwd(), "public", "logo");
const LOGO_CANDIDATES = ["logo.svg", "logo.png", "logo.webp", "logo.jpg", "logo.jpeg"] as const;

function logoPath(filename: string): string {
  return path.join(LOGO_DIR, filename);
}

export async function ensureLogoDir(): Promise<void> {
  await fs.mkdir(LOGO_DIR, { recursive: true });
}

export async function getSiteLogo(): Promise<{ src: string | null; version: number }> {
  await ensureLogoDir();
  for (const name of LOGO_CANDIDATES) {
    try {
      const stat = await fs.stat(logoPath(name));
      return { src: `/logo/${name}`, version: stat.mtimeMs || Date.now() };
    } catch {
      /* file assente */
    }
  }
  return { src: null, version: 0 };
}

function normalizeExt(filename: string): ".svg" | ".png" | ".webp" | ".jpg" {
  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : ".png";
  if (ext === ".svg") return ".svg";
  if (ext === ".webp") return ".webp";
  if (ext === ".png") return ".png";
  return ".jpg";
}

export async function saveSiteLogo(buffer: Buffer, originalName: string): Promise<{ src: string; version: number }> {
  await ensureLogoDir();

  for (const name of LOGO_CANDIDATES) {
    try {
      await fs.unlink(logoPath(name));
    } catch {
      /* ignore */
    }
  }

  const ext = normalizeExt(originalName);
  const filename = `logo${ext}`;
  await fs.writeFile(logoPath(filename), buffer);

  return { src: `/logo/${filename}`, version: Date.now() };
}
