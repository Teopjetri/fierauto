import type { PhotoOrientation } from "../types";

export interface CarMediaPhoto {
  id: string;
  src: string;
  filename: string;
  orientation: PhotoOrientation;
  isHero: boolean;
  order: number;
  alt: string;
  createdAt: string;
}

export interface CarMediaManifest {
  slug: string;
  photos: CarMediaPhoto[];
  updatedAt: string;
}

export function emptyManifest(slug: string): CarMediaManifest {
  return { slug, photos: [], updatedAt: new Date().toISOString() };
}

export function sortPhotos(photos: CarMediaPhoto[]): CarMediaPhoto[] {
  return [...photos].sort((a, b) => a.order - b.order);
}

export function getHeroPhoto(photos: CarMediaPhoto[]): CarMediaPhoto | null {
  const sorted = sortPhotos(photos);
  return sorted.find((p) => p.isHero) ?? sorted[0] ?? null;
}

export function getGalleryPhotos(photos: CarMediaPhoto[]): CarMediaPhoto[] {
  const sorted = sortPhotos(photos);
  const hero = getHeroPhoto(sorted);
  if (!hero) return sorted;
  return sorted.filter((p) => p.id !== hero.id);
}

export function detectOrientation(width: number, height: number): PhotoOrientation {
  const ratio = width / height;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.88) return "portrait";
  return "square";
}
