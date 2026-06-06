import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdmin";
import { duplicateListing } from "@/lib/listings/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: RouteParams) {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  try {
    return NextResponse.json(await duplicateListing(id));
  } catch {
    return NextResponse.json({ error: "Duplicazione fallita" }, { status: 404 });
  }
}
