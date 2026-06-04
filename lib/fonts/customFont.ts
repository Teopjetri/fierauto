/** Base URL path for files in /public/fonts */
export const CUSTOM_FONTS_PATH = "/fonts";

export type CustomFontFile = `${string}.${"ttf" | "otf" | "TTF" | "OTF"}`;

/** Public URL for a font file. Example: customFontUrl("BebasNeue.ttf") → "/fonts/BebasNeue.ttf" */
export function customFontUrl(filename: string): string {
  return `${CUSTOM_FONTS_PATH}/${encodeURIComponent(filename)}`;
}

/** CSS font-family name from filename. Example: "BebasNeue.ttf" → "BebasNeue" */
export function customFontFamily(filename: string): string {
  return filename.replace(/\.(ttf|otf)$/i, "");
}

function fontFormat(filename: string): "opentype" | "truetype" {
  return filename.toLowerCase().endsWith(".otf") ? "opentype" : "truetype";
}

export interface CustomFontFaceOptions {
  weight?: number | string;
  style?: "normal" | "italic" | "oblique";
  /** Shared CSS family when loading individual weight files */
  family?: string;
}

/** Single @font-face rule for a file in /public/fonts */
export function customFontFaceCss(
  filename: string,
  options: CustomFontFaceOptions = {}
): string {
  const { weight = 400, style = "normal", family: familyOverride } = options;
  const family = familyOverride ?? customFontFamily(filename);
  const url = customFontUrl(filename);

  return `@font-face {
  font-family: "${family}";
  src: url("${url}") format("${fontFormat(filename)}");
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`;
}

/** CSS variable name from filename. Example: "BebasNeue.ttf" → "--font-bebas-neue" */
export function customFontVariable(filename: string): string {
  const slug = customFontFamily(filename)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
  return `--font-${slug}`;
}
