import type { CustomFontFaceOptions } from "./customFont";

/**
 * Fonts to load from /public/fonts.
 * Add an entry here when you assign a font to part of the UI.
 *
 * Example:
 *   { filename: "BebasNeue.ttf" }
 */
export type CustomFontEntry = {
  filename: string;
} & CustomFontFaceOptions;

/** Registered custom fonts — empty until a font is assigned. */
export const customFontRegistry: CustomFontEntry[] = [
  { filename: "Avilock Bold.ttf", family: "Avilock", weight: 700 },
];
