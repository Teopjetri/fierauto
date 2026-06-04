import type { Car } from "../types";
import type { CarMediaManifest, CarMediaPhoto } from "../media/types";
import { getGalleryPhotos, getHeroPhoto, readCarMedia, readAllCarMedia } from "../media/carMediaStore";

export interface CarWithMedia extends Car {
  media: CarMediaManifest;
  heroPhoto: CarMediaPhoto | null;
  galleryPhotos: CarMediaPhoto[];
}

export async function getCarWithMedia(slug: string, car: Car): Promise<CarWithMedia> {
  const media = await readCarMedia(slug);
  const heroPhoto = getHeroPhoto(media.photos);
  const galleryPhotos = getGalleryPhotos(media.photos);
  return { ...car, media, heroPhoto, galleryPhotos };
}

export async function getAllCarsWithMedia(cars: Car[]): Promise<CarWithMedia[]> {
  const allMedia = await readAllCarMedia();
  return cars.map((car) => {
    const media = allMedia[car.slug] ?? { slug: car.slug, photos: [], updatedAt: "" };
    const heroPhoto = getHeroPhoto(media.photos);
    const galleryPhotos = getGalleryPhotos(media.photos);
    return { ...car, media, heroPhoto, galleryPhotos };
  });
}
