import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdmin";
import { searchBrands } from "@/lib/automotive";

export async function GET(req: Request) {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return NextResponse.json(searchBrands(q).map((b) => ({ name: b.name })));
}
