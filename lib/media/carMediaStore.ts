import { promises as fs } from "fs";
import path from "path";
import { cars } from "../data/cars";
import {
  emptyManifest,
  getGalleryPhotos,
  getHeroPhoto,
  sortPhotos,
  type CarMediaManifest,
  type CarMediaPhoto,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "car-media");
const UPLOADS_DIR = path.join(process.cwd(), "public", "cars", "uploads");

function manifestPath(slug: string): string {
  return path.join(DATA_DIR, `${slug}.json`);
}

function uploadDir(slug: string): string {
  return path.join(UPLOADS_DIR, slug);
}

export async function ensureMediaDirs(slug: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(uploadDir(slug), { recursive: true });
}

export async function readCarMedia(slug: string): Promise<CarMediaManifest> {
  await ensureMediaDirs(slug);
  try {
    const raw = await fs.readFile(manifestPath(slug), "utf-8");
    const parsed = JSON.parse(raw) as CarMediaManifest;
    return { ...parsed, photos: sortPhotos(parsed.photos ?? []) };
  } catch {
    return emptyManifest(slug);
  }
}

export async function writeCarMedia(manifest: CarMediaManifest): Promise<void> {
  await ensureMediaDirs(manifest.slug);
  const next: CarMediaManifest = {
    ...manifest,
    photos: sortPhotos(manifest.photos),
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(manifestPath(manifest.slug), JSON.stringify(next, null, 2), "utf-8");
}

export async function readAllCarMedia(): Promise<Record<string, CarMediaManifest>> {
  const entries = await Promise.all(
    cars.map(async (car) => [car.slug, await readCarMedia(car.slug)] as const)
  );
  return Object.fromEntries(entries);
}

export function getUploadDir(slug: string): string {
  return uploadDir(slug);
}

export function publicSrc(slug: string, filename: string): string {
  return `/cars/uploads/${slug}/${filename}`;
}

export async function addPhoto(
  slug: string,
  file: { buffer: Buffer; originalName: string; orientation: CarMediaPhoto["orientation"] }
): Promise<CarMediaManifest> {
  const manifest = await readCarMedia(slug);
  const ext = path.extname(file.originalName).toLowerCase() || ".jpg";
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const filename = `${id}${ext}`;
  await ensureMediaDirs(slug);
  await fs.writeFile(path.join(uploadDir(slug), filename), file.buffer);

  const car = cars.find((c) => c.slug === slug);
  const isFirst = manifest.photos.length === 0;

  const photo: CarMediaPhoto = {
    id,
    src: publicSrc(slug, filename),
    filename,
    orientation: file.orientation,
    isHero: isFirst,
    order: manifest.photos.length,
    alt: car ? `${car.brand} ${car.model} — Fierauto Studio` : "Fierauto Studio",
    createdAt: new Date().toISOString(),
  };

  manifest.photos.push(photo);
  await writeCarMedia(manifest);
  return readCarMedia(slug);
}

export async function deletePhoto(slug: string, photoId: string): Promise<CarMediaManifest> {
  const manifest = await readCarMedia(slug);
  const target = manifest.photos.find((p) => p.id === photoId);
  if (!target) return manifest;

  try {
    await fs.unlink(path.join(uploadDir(slug), target.filename));
  } catch {
    /* file may already be gone */
  }

  let remaining = manifest.photos.filter((p) => p.id !== photoId);
  remaining = remaining.map((p, i) => ({ ...p, order: i }));

  if (target.isHero && remaining.length > 0) {
    remaining[0] = { ...remaining[0], isHero: true };
  }

  await writeCarMedia({ ...manifest, photos: remaining });
  return readCarMedia(slug);
}

export async function updateCarMedia(
  slug: string,
  updates: {
    order?: string[];
    heroId?: string;
    orientations?: Record<string, CarMediaPhoto["orientation"]>;
  }
): Promise<CarMediaManifest> {
  const manifest = await readCarMedia(slug);
  let photos = [...manifest.photos];

  if (updates.order?.length) {
    const map = new Map(photos.map((p) => [p.id, p]));
    photos = updates.order
      .map((id, index) => {
        const photo = map.get(id);
        return photo ? { ...photo, order: index } : null;
      })
      .filter((p): p is CarMediaPhoto => p !== null);
  }

  if (updates.heroId) {
    photos = photos.map((p) => ({ ...p, isHero: p.id === updates.heroId }));
  }

  if (updates.orientations) {
    photos = photos.map((p) =>
      updates.orientations![p.id] ? { ...p, orientation: updates.orientations![p.id] } : p
    );
  }

  await writeCarMedia({ ...manifest, photos });
  return readCarMedia(slug);
}

export { getHeroPhoto, getGalleryPhotos, sortPhotos };
