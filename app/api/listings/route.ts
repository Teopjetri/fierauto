import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdmin";
import { createDraftListing, createListing, getAllListings } from "@/lib/listings/store";
import type { ListingInput } from "@/lib/listings/types";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(await getAllListings());
}

export async function POST(req: Request) {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  const body = (await req.json()) as ListingInput & { draft?: boolean };

  if (body.draft) {
    console.log("[UPLOAD-DIAG] api:listings:POST:draft:start");
    const draft = await createDraftListing();
    console.log("[UPLOAD-DIAG] api:listings:POST:draft:ok", { id: draft.id });
    return NextResponse.json(draft);
  }

  if (!body.brand?.trim() || !body.model?.trim()) {
    return NextResponse.json({ error: "Marca e modello obbligatori." }, { status: 400 });
  }
  const listing = await createListing(body);
  return NextResponse.json(listing);
}
