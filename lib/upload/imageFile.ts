export interface LocalImagePreview {
  id: string;
  file: File;
  previewUrl: string;
}

/**
 * Copia il file selezionato dal picker prima di resettare l'input.
 * Su Safari/iOS il reset invalida i File originali e rompe blob: preview + upload.
 */
export async function detachImageFile(file: File): Promise<File> {
  const buffer = await file.arrayBuffer();
  if (!buffer.byteLength) {
    throw new Error("Il file immagine è vuoto. Seleziona di nuovo la foto.");
  }
  return new File([buffer], file.name, {
    type: file.type || "application/octet-stream",
    lastModified: file.lastModified,
  });
}

/** Accetta JPG, PNG, WEBP, HEIC e foto smartphone con MIME vuoto o generico. */
export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  if (/\.(heic|heif|jpe?g|png|webp|avif|gif)$/i.test(file.name)) return true;
  if (file.size > 0 && (!file.type || file.type === "application/octet-stream")) return true;
  return false;
}

export function createLocalImagePreview(file: File, index = 0): LocalImagePreview {
  const stamp = Date.now();
  return {
    id: `${stamp}-${index}-${file.name}-${file.size}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export async function buildLocalImagePreviews(
  files: File[],
  options?: { startIndex?: number }
): Promise<LocalImagePreview[]> {
  const start = options?.startIndex ?? 0;
  const owned = await Promise.all(files.map((file) => detachImageFile(file)));
  return owned.map((file, index) => createLocalImagePreview(file, start + index));
}

export function revokeLocalImagePreviews(previews: LocalImagePreview[]): void {
  previews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
}
