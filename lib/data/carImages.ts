import type { CarPhoto } from "../types";
import type { CarMediaPhoto } from "../media/types";
import type { Car } from "../types";
import { mediaToCarPhoto } from "../media/photoUtils";

/** @deprecated Usare CarMediaPhoto dal sistema upload. Mantenuto per compatibilità UI. */
export function getCoverPhotoFromMedia(
  heroPhoto: CarMediaPhoto | null,
  car: Car
): CarPhoto | null {
  return heroPhoto ? mediaToCarPhoto(heroPhoto, car, { hero: true }) : null;
}
