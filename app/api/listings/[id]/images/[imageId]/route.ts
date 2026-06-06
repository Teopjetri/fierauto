import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdmin";
import { deleteListingImage } from "@/lib/listings/store";

interface RouteParams {
  params: Promise<{ id: string; imageId: string }>;
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  const { id, imageId } = await params;
  try {
    return NextResponse.json(await deleteListingImage(id, imageId));
  } catch {
    return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  }
}
