import { NextResponse } from "next/server";
import { duplicateListing } from "@/lib/listings/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    return NextResponse.json(await duplicateListing(id));
  } catch {
    return NextResponse.json({ error: "Duplicazione fallita" }, { status: 404 });
  }
}
