import type { Car } from "../types";
import type { CarPhoto } from "../types";
import type { CarMediaPhoto } from "./types";

export function mediaToCarPhoto(photo: CarMediaPhoto, car: Car, opts?: { hero?: boolean }): CarPhoto {
  return {
    src: photo.src,
    type: "threeQuarter",
    alt: photo.alt || `${car.brand} ${car.model}`,
    orientation: photo.orientation,
    focus: opts?.hero || photo.isHero ? "right" : "center",
  };
}

export function buildCarPhotos(photos: CarMediaPhoto[], car: Car): CarPhoto[] {
  return photos.map((p) => mediaToCarPhoto(p, car, { hero: p.isHero }));
}
