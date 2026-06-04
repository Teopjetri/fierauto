import { NextResponse } from "next/server";
import { deletePhoto } from "@/lib/media/carMediaStore";
import { getCarBySlug } from "@/lib/data/cars";

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { slug, id } = await params;
  if (!getCarBySlug(slug)) {
    return NextResponse.json({ error: "Veicolo non trovato" }, { status: 404 });
  }
  const manifest = await deletePhoto(slug, id);
  return NextResponse.json(manifest);
}
