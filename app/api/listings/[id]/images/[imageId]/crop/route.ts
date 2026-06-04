import { NextResponse } from "next/server";
import { setListingImageCrop } from "@/lib/listings/store";

interface RouteParams {
  params: Promise<{ id: string; imageId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const { id, imageId } = await params;
  const form = await req.formData();
  const crop = form.get("crop");

  if (!(crop instanceof File)) {
    return NextResponse.json({ error: "Nessun ritaglio inviato." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await crop.arrayBuffer());
    return NextResponse.json(await setListingImageCrop(id, imageId, buffer));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Salvataggio ritaglio fallito" },
      { status: 400 }
    );
  }
}
