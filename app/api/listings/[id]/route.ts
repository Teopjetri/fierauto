import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdmin";
import { deleteListing, getListingById, updateListing } from "@/lib/listings/store";
import type { ListingInput } from "@/lib/listings/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = (await req.json()) as Partial<ListingInput> & { published?: boolean };
  try {
    return NextResponse.json(await updateListing(id, body));
  } catch {
    return NextResponse.json({ error: "Annuncio non trovato" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await deleteListing(id);
  return NextResponse.json({ ok: true });
}
