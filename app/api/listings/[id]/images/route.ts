import { NextResponse } from "next/server";
import { addListingImages, getListingById } from "@/lib/listings/store";
import { MAX_LISTING_IMAGES } from "@/lib/listings/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const { id } = await params;
  console.log("[UPLOAD-DIAG] api:listings-images:POST:received", { listingId: id });

  const listing = await getListingById(id);
  if (!listing) {
    console.warn("[UPLOAD-DIAG] api:listings-images:POST:not-found", { listingId: id });
    return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  console.log("[UPLOAD-DIAG] api:listings-images:POST:parsed", {
    listingId: id,
    fileCount: files.length,
    files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
  });
  if (!files.length) {
    return NextResponse.json({ error: "Nessun file." }, { status: 400 });
  }

  if (listing.images.length >= MAX_LISTING_IMAGES) {
    return NextResponse.json({ error: `Massimo ${MAX_LISTING_IMAGES} immagini.` }, { status: 400 });
  }

  const buffers = await Promise.all(
    files.map(async (file) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      originalName: file.name,
    }))
  );

  try {
    const result = await addListingImages(id, buffers);
    console.log("[UPLOAD-DIAG] api:listings-images:POST:ok", {
      listingId: id,
      imageCount: result.images.length,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[UPLOAD-DIAG] api:listings-images:POST:error", {
      listingId: id,
      error: e instanceof Error ? e.message : e,
    });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload fallito" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();
  const { reorderListingImages } = await import("@/lib/listings/store");

  if (body.order?.length) {
    return NextResponse.json(await reorderListingImages(id, body.order));
  }

  return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
}
