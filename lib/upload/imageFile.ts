export interface LocalImagePreview {
  id: string;
  file: File;
  previewUrl: string;
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

export function buildLocalImagePreviews(
  files: File[],
  options?: { startIndex?: number }
): LocalImagePreview[] {
  const start = options?.startIndex ?? 0;
  return files.map((file, index) => createLocalImagePreview(file, start + index));
}

export function revokeLocalImagePreviews(previews: LocalImagePreview[]): void {
  previews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
}
