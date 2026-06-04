import { NextResponse } from "next/server";
import { searchBrands } from "@/lib/automotive";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return NextResponse.json(searchBrands(q).map((b) => ({ name: b.name })));
}
