/** Parità indice → immagine a sinistra; dispari → immagine a destra */
export function isImageLeftBlock(index: number): boolean {
  return index % 2 === 0;
}

/** @deprecated Usare isImageLeftBlock */
export const isHorizontalLeftBlock = isImageLeftBlock;
