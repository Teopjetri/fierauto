export type ListingStatus = "draft" | "published" | "hidden" | "sold";

export interface ListingImage {
  id: string;
  /** Foto originale — usata nella scheda vettura (4:3) */
  src: string;
  filename: string;
  /** Ritaglio verticale 4:5 per la homepage */
  cropSrc?: string;
  cropFilename?: string;
  order: number;
  createdAt: string;
}

export interface Listing {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: string;
  powerCv: string;
  fuel: string;
  mileage: string;
  price: string;
  description: string;
  status: ListingStatus;
  /** @deprecated use status */
  published?: boolean;
  images: ListingImage[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListingInput {
  brand: string;
  model: string;
  version: string;
  year: string;
  powerCv: string;
  fuel: string;
  mileage: string;
  price: string;
  description: string;
  status?: ListingStatus;
}

export const MAX_LISTING_IMAGES = 10;

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Bozza",
  published: "Pubblicato",
  hidden: "Nascosto",
  sold: "Venduto",
};

export const HOME_PHOTO_ASPECT = "aspect-[4/5]";
export const DETAIL_PHOTO_ASPECT = "aspect-[4/3]";

/** @deprecated Usare HOME_PHOTO_ASPECT */
export const PHOTO_ASPECT = HOME_PHOTO_ASPECT;

export function sortImages(images: ListingImage[]): ListingImage[] {
  return [...images].sort((a, b) => a.order - b.order);
}

export function coverImage(listing: Listing): ListingImage | null {
  return sortImages(listing.images)[0] ?? null;
}

/** Ritaglio 4:5 homepage — obbligatorio per la vetrina */
export function homeCropSrc(image: ListingImage): string | null {
  return image.cropSrc ?? null;
}

/** @deprecated Usare homeCropSrc per la homepage */
export function homeImageSrc(image: ListingImage): string {
  return image.cropSrc ?? image.src;
}

export function hasHomeCrop(image: ListingImage): boolean {
  return Boolean(image.cropSrc);
}

export function isPublishedOnHome(listing: Listing): boolean {
  const cover = coverImage(listing);
  return (
    normalizeStatus(listing) === "published" &&
    listing.images.length > 0 &&
    Boolean(cover && homeCropSrc(cover))
  );
}

export function normalizeStatus(listing: Listing): ListingStatus {
  if (listing.status) return listing.status;
  return listing.published ? "published" : "draft";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
