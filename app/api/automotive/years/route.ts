import { NextResponse } from "next/server";
import { getYearsForModel } from "@/lib/automotive";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const brand = params.get("brand") ?? "";
  const model = params.get("model") ?? "";
  if (!brand || !model) return NextResponse.json([]);
  return NextResponse.json(getYearsForModel(brand, model));
}
