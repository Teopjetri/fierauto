import { promises as fs } from "fs";
import path from "path";
import { normalizeListingImageBuffer } from "@/lib/images/normalizeListingImage";
import {
  isPublishedOnHome,
  MAX_LISTING_IMAGES,
  normalizeStatus,
  sortImages,
  slugify,
  type Listing,
  type ListingImage,
  type ListingInput,
  type ListingStatus,
} from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "listings", "listings.json");
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "listings");

function migrateListing(raw: Record<string, unknown>): Listing {
  const l = raw as unknown as Listing;
  const status =
    l.status ?? ((raw.published as boolean) ? "published" : "draft");
  return {
    ...l,
    version: l.version ?? "",
    powerCv: l.powerCv ?? "",
    status,
    images: sortImages(l.images ?? []),
  };
}

async function ensureDirs(listingId?: string): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  if (listingId) await fs.mkdir(path.join(UPLOAD_ROOT, listingId), { recursive: true });
}

async function readAll(): Promise<Listing[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((item) => migrateListing(item));
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
    return [];
  }
}

async function writeAll(listings: Listing[]): Promise<void> {
  await ensureDirs();
  const sorted = [...listings].sort((a, b) => a.order - b.order);
  await fs.writeFile(DATA_FILE, JSON.stringify(sorted, null, 2), "utf-8");
}

function uniqueSlug(base: string, listings: Listing[], excludeId?: string): string {
  let slug = base || `annuncio-${Date.now()}`;
  let n = 0;
  while (listings.some((l) => l.slug === slug && l.id !== excludeId)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function publicSrc(listingId: string, filename: string): string {
  return `/uploads/listings/${listingId}/${filename}`;
}

export async function getAllListings(): Promise<Listing[]> {
  return readAll();
}

export async function getPublishedListings(): Promise<Listing[]> {
  const all = await readAll();
  return all.filter(isPublishedOnHome).sort((a, b) => a.order - b.order);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const all = await readAll();
  return all.find((l) => l.id === id) ?? null;
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const all = await readAll();
  return all.find((l) => l.slug === slug) ?? null;
}

export async function createDraftListing(): Promise<Listing> {
  const all = await readAll();
  const now = new Date().toISOString();
  const id = `listing-${Date.now()}`;
  const listing: Listing = {
    id,
    slug: uniqueSlug(`bozza-${id}`, all),
    brand: "",
    model: "",
    version: "",
    year: "",
    powerCv: "",
    fuel: "",
    mileage: "",
    price: "",
    description: "",
    status: "draft",
    images: [],
    order: all.length,
    createdAt: now,
    updatedAt: now,
  };
  await writeAll([...all, listing]);
  return listing;
}

export async function createListing(input: ListingInput): Promise<Listing> {
  const all = await readAll();
  const now = new Date().toISOString();
  const id = `listing-${Date.now()}`;
  const baseSlug = slugify(`${input.brand}-${input.model}-${input.year}`);
  const listing: Listing = {
    id,
    slug: uniqueSlug(baseSlug, all),
    brand: input.brand.trim(),
    model: input.model.trim(),
    version: input.version.trim(),
    year: input.year.trim(),
    powerCv: input.powerCv.trim(),
    fuel: input.fuel.trim(),
    mileage: input.mileage.trim(),
    price: input.price.trim(),
    description: input.description.trim(),
    status: input.status ?? "draft",
    images: [],
    order: all.length,
    createdAt: now,
    updatedAt: now,
  };
  await writeAll([...all, listing]);
  return listing;
}

export async function updateListing(
  id: string,
  patch: Partial<ListingInput> & { status?: ListingStatus; order?: number }
): Promise<Listing> {
  const all = await readAll();
  const idx = all.findIndex((l) => l.id === id);
  if (idx < 0) throw new Error("Annuncio non trovato");

  const current = all[idx];
  const brand = patch.brand !== undefined ? patch.brand.trim() : current.brand;
  const model = patch.model !== undefined ? patch.model.trim() : current.model;
  const year = patch.year !== undefined ? patch.year.trim() : current.year;

  let slug = current.slug;
  if (patch.brand !== undefined || patch.model !== undefined || patch.year !== undefined) {
    slug = uniqueSlug(slugify(`${brand}-${model}-${year}`), all, id);
  }

  const updated: Listing = {
    ...current,
    brand,
    model,
    year,
    version: patch.version !== undefined ? patch.version.trim() : current.version,
    powerCv: patch.powerCv !== undefined ? patch.powerCv.trim() : current.powerCv,
    fuel: patch.fuel !== undefined ? patch.fuel.trim() : current.fuel,
    mileage: patch.mileage !== undefined ? patch.mileage.trim() : current.mileage,
    price: patch.price !== undefined ? patch.price.trim() : current.price,
    description: patch.description !== undefined ? patch.description.trim() : current.description,
    status: patch.status !== undefined ? patch.status : current.status,
    order: patch.order !== undefined ? patch.order : current.order,
    slug,
    updatedAt: new Date().toISOString(),
  };

  all[idx] = updated;
  await writeAll(all);
  return updated;
}

export async function duplicateListing(id: string): Promise<Listing> {
  const source = await getListingById(id);
  if (!source) throw new Error("Annuncio non trovato");

  const all = await readAll();
  const now = new Date().toISOString();
  const newId = `listing-${Date.now()}`;
  await ensureDirs(newId);

  const copiedImages: ListingImage[] = [];
  for (const img of sortImages(source.images)) {
    const ext = path.extname(img.filename) || ".jpg";
    const imageId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const filename = `${imageId}${ext}`;
    try {
      await fs.copyFile(
        path.join(UPLOAD_ROOT, id, img.filename),
        path.join(UPLOAD_ROOT, newId, filename)
      );
      let cropSrc: string | undefined;
      let cropFilename: string | undefined;
      if (img.cropFilename) {
        cropFilename = `${imageId}-home.jpg`;
        await fs.copyFile(
          path.join(UPLOAD_ROOT, id, img.cropFilename),
          path.join(UPLOAD_ROOT, newId, cropFilename)
        );
        cropSrc = publicSrc(newId, cropFilename);
      }
      copiedImages.push({
        id: imageId,
        src: publicSrc(newId, filename),
        filename,
        cropSrc,
        cropFilename,
        order: copiedImages.length,
        createdAt: now,
      });
    } catch {
      /* skip missing files */
    }
  }

  const baseSlug = slugify(`${source.brand}-${source.model}-${source.year}`);
  const listing: Listing = {
    ...source,
    id: newId,
    slug: uniqueSlug(`${baseSlug}-copia`, all),
    status: "draft",
    images: copiedImages,
    order: all.length,
    createdAt: now,
    updatedAt: now,
  };

  await writeAll([...all, listing]);
  return listing;
}

export async function deleteListing(id: string): Promise<void> {
  const all = await readAll();
  try {
    await fs.rm(path.join(UPLOAD_ROOT, id), { recursive: true, force: true });
  } catch {
    /* ignore */
  }
  const remaining = all.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i }));
  await writeAll(remaining);
}

export async function addListingImages(
  id: string,
  files: { buffer: Buffer; originalName: string }[]
): Promise<Listing> {
  console.log("[UPLOAD-DIAG] store:addListingImages:start", {
    listingId: id,
    fileCount: files.length,
  });
  const listing = await getListingById(id);
  if (!listing) throw new Error("Annuncio non trovato");

  const remaining = MAX_LISTING_IMAGES - listing.images.length;
  if (remaining <= 0) throw new Error(`Massimo ${MAX_LISTING_IMAGES} immagini per annuncio.`);

  await ensureDirs(id);
  const newImages: ListingImage[] = [];

  for (const file of files.slice(0, remaining)) {
    if (!file.buffer.length) {
      throw new Error("Il file immagine è vuoto. Seleziona di nuovo la foto.");
    }

    const { buffer: jpegBuffer, filename, imageId } = await normalizeListingImageBuffer(
      file.buffer,
      file.originalName
    );
    await fs.writeFile(path.join(UPLOAD_ROOT, id, filename), jpegBuffer);
    console.log("[UPLOAD-DIAG] store:addListingImages:written", {
      listingId: id,
      filename,
      bytes: jpegBuffer.length,
      originalName: file.originalName,
    });
    newImages.push({
      id: imageId,
      src: publicSrc(id, filename),
      filename,
      order: listing.images.length + newImages.length,
      createdAt: new Date().toISOString(),
    });
  }

  const updated = await updateListingImages(id, [...listing.images, ...newImages]);
  console.log("[UPLOAD-DIAG] store:addListingImages:done", {
    listingId: id,
    added: newImages.length,
  });
  return updated;
}

async function updateListingImages(id: string, images: ListingImage[]): Promise<Listing> {
  const all = await readAll();
  const idx = all.findIndex((l) => l.id === id);
  if (idx < 0) throw new Error("Annuncio non trovato");
  all[idx] = {
    ...all[idx],
    images: sortImages(images.map((img, i) => ({ ...img, order: i }))),
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[idx];
}

export async function deleteListingImage(listingId: string, imageId: string): Promise<Listing> {
  const listing = await getListingById(listingId);
  if (!listing) throw new Error("Annuncio non trovato");
  const target = listing.images.find((i) => i.id === imageId);
  if (target) {
    for (const file of [target.filename, target.cropFilename]) {
      if (!file) continue;
      try {
        await fs.unlink(path.join(UPLOAD_ROOT, listingId, file));
      } catch {
        /* ignore */
      }
    }
  }
  return updateListingImages(
    listingId,
    listing.images.filter((i) => i.id !== imageId)
  );
}

export async function setListingImageCrop(
  listingId: string,
  imageId: string,
  buffer: Buffer
): Promise<Listing> {
  const listing = await getListingById(listingId);
  if (!listing) throw new Error("Annuncio non trovato");
  const target = listing.images.find((i) => i.id === imageId);
  if (!target) throw new Error("Immagine non trovata");

  await ensureDirs(listingId);
  const cropFilename = `${imageId}-home.jpg`;
  const cropPath = path.join(UPLOAD_ROOT, listingId, cropFilename);

  if (target.cropFilename && target.cropFilename !== cropFilename) {
    try {
      await fs.unlink(path.join(UPLOAD_ROOT, listingId, target.cropFilename));
    } catch {
      /* ignore */
    }
  }

  await fs.writeFile(cropPath, buffer);

  const updatedImages = listing.images.map((img) =>
    img.id === imageId
      ? {
          ...img,
          cropSrc: publicSrc(listingId, cropFilename),
          cropFilename,
        }
      : img
  );

  return updateListingImages(listingId, updatedImages);
}

export async function reorderListingImages(listingId: string, order: string[]): Promise<Listing> {
  const listing = await getListingById(listingId);
  if (!listing) throw new Error("Annuncio non trovato");
  const map = new Map(listing.images.map((i) => [i.id, i]));
  const reordered = order
    .map((id, index) => {
      const img = map.get(id);
      return img ? { ...img, order: index } : null;
    })
    .filter((i): i is ListingImage => i !== null);
  return updateListingImages(listingId, reordered);
}
