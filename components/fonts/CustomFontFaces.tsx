import { customFontFaceCss } from "@/lib/fonts/customFont";
import { customFontRegistry } from "@/lib/fonts/registry";

/**
 * Injects @font-face rules for files listed in lib/fonts/registry.ts.
 * No output until fonts are registered.
 */
export function CustomFontFaces() {
  if (customFontRegistry.length === 0) return null;

  const css = customFontRegistry
    .map((entry) =>
      customFontFaceCss(entry.filename, {
        weight: entry.weight,
        style: entry.style,
        family: entry.family,
      })
    )
    .join("\n");

  return (
    <style
      data-custom-fonts=""
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
