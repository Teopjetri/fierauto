import type { PhotoOrientation } from "./types";

export type ShowroomLayoutType =
  | "wide-left"
  | "portrait-right"
  | "cinematic-overlay"
  | "compact";

export const showroomLayoutSequence: ShowroomLayoutType[] = [
  "wide-left",
  "portrait-right",
  "cinematic-overlay",
  "compact",
];

export function getShowroomLayout(index: number): ShowroomLayoutType {
  return showroomLayoutSequence[index % showroomLayoutSequence.length];
}

export type SlotOrientation = "horizontal" | "vertical";

export function toSlotOrientation(orientation?: PhotoOrientation): SlotOrientation {
  return orientation === "portrait" ? "vertical" : "horizontal";
}
