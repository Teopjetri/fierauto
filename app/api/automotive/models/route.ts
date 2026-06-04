import { NextResponse } from "next/server";
import { getModelsForBrand } from "@/lib/automotive";

export async function GET(req: Request) {
  const brand = new URL(req.url).searchParams.get("brand") ?? "";
  if (!brand) return NextResponse.json([]);
  return NextResponse.json(getModelsForBrand(brand).map((m) => ({ name: m.name })));
}
