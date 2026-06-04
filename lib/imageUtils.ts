import type { CarPhoto, PhotoOrientation } from "./types";

export type EditorialLayout = "hero" | "wide" | "tall" | "standard";

export const editorialPatterns: EditorialLayout[] = [
  "hero",
  "tall",
  "standard",
  "wide",
  "tall",
  "standard",
];

export function getPhotoOrientation(photo: CarPhoto): PhotoOrientation {
  return photo.orientation ?? "landscape";
}

export function getAspectRatio(orientation: PhotoOrientation): string {
  switch (orientation) {
    case "portrait":
      return "3 / 4";
    case "square":
      return "1 / 1";
    default:
      return "16 / 10";
  }
}

export function getLayoutForIndex(index: number): EditorialLayout {
  return editorialPatterns[index % editorialPatterns.length];
}

export function getLayoutClasses(layout: EditorialLayout): string {
  switch (layout) {
    case "hero":
      return "col-span-12 lg:col-span-8 row-span-2";
    case "wide":
      return "col-span-12 md:col-span-2 lg:col-span-8";
    case "tall":
      return "col-span-12 sm:col-span-1 lg:col-span-4";
    default:
      return "col-span-12 sm:col-span-1 lg:col-span-4";
  }
}

export function getCardImageHeight(layout: EditorialLayout, orientation: PhotoOrientation): string {
  if (layout === "hero") return orientation === "portrait" ? "min-h-[520px] lg:min-h-[640px]" : "min-h-[380px] lg:min-h-[520px]";
  if (layout === "tall" || orientation === "portrait") return "min-h-[420px] lg:min-h-[520px]";
  if (layout === "wide") return "min-h-[280px] lg:min-h-[340px]";
  return "min-h-[300px] lg:min-h-[360px]";
}

export function getObjectPosition(photo: CarPhoto): string {
  const focus = photo.focus ?? "center";
  const map: Record<NonNullable<CarPhoto["focus"]>, string> = {
    center: "center 58%",
    top: "center top",
    bottom: "center bottom",
    left: "left center",
    right: "72% 58%",
  };
  return map[focus];
}
