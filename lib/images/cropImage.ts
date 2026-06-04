export const CROP_ASPECT = 4 / 5;
export const CROP_OUTPUT_WIDTH = 1200;
export const CROP_OUTPUT_HEIGHT = 1500;

export interface CropTransform {
  baseScale: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export function computeBaseScale(
  imageWidth: number,
  imageHeight: number,
  cropWidth: number,
  cropHeight: number
): number {
  return Math.max(cropWidth / imageWidth, cropHeight / imageHeight);
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Impossibile caricare l'immagine"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function renderCropToCanvas(
  image: HTMLImageElement,
  cropWidth: number,
  cropHeight: number,
  transform: CropTransform
): HTMLCanvasElement {
  const scale = transform.baseScale * transform.zoom;
  const imgW = image.naturalWidth * scale;
  const imgH = image.naturalHeight * scale;
  const imgX = cropWidth / 2 - imgW / 2 + transform.offsetX;
  const imgY = cropHeight / 2 - imgH / 2 + transform.offsetY;

  const sx = Math.max(0, -imgX / scale);
  const sy = Math.max(0, -imgY / scale);
  const sw = Math.min(image.naturalWidth - sx, cropWidth / scale);
  const sh = Math.min(image.naturalHeight - sy, cropHeight / scale);

  const canvas = document.createElement("canvas");
  canvas.width = CROP_OUTPUT_WIDTH;
  canvas.height = CROP_OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supportato");

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, CROP_OUTPUT_WIDTH, CROP_OUTPUT_HEIGHT);
  return canvas;
}

export async function cropFileToBlob(
  file: File,
  cropWidth: number,
  cropHeight: number,
  transform: CropTransform
): Promise<Blob> {
  const image = await loadImageFromFile(file);
  const canvas = renderCropToCanvas(image, cropWidth, cropHeight, transform);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Esportazione crop fallita"))),
      "image/jpeg",
      0.92
    );
  });
  return blob;
}
