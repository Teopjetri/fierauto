import sharp from "sharp";

export function newListingImageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Converte qualsiasi foto (HEIC, PNG, WEBP, JPEG) in JPEG visualizzabile ovunque. */
export async function normalizeListingImageBuffer(
  input: Buffer,
  originalName: string
): Promise<{ buffer: Buffer; imageId: string; filename: string }> {
  if (!input.length) {
    throw new Error("Il file immagine è vuoto. Seleziona di nuovo la foto.");
  }

  try {
    const buffer = await sharp(input, { failOn: "none" })
      .rotate()
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    if (!buffer.length) {
      throw new Error("Impossibile elaborare l'immagine.");
    }

    const imageId = newListingImageId();
    return {
      buffer,
      imageId,
      filename: `${imageId}.jpg`,
    };
  } catch (err) {
    console.error("[UPLOAD-DIAG] normalizeListingImageBuffer:error", {
      originalName,
      bytes: input.length,
      error: err instanceof Error ? err.message : err,
    });
    throw new Error("Formato immagine non supportato o file danneggiato.");
  }
}
