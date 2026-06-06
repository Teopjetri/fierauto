import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdmin";
import { getYearsForModel } from "@/lib/automotive";

export async function GET(req: Request) {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  const params = new URL(req.url).searchParams;
  const brand = params.get("brand") ?? "";
  const model = params.get("model") ?? "";
  if (!brand || !model) return NextResponse.json([]);
  return NextResponse.json(getYearsForModel(brand, model));
}
