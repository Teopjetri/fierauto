import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/requireAdmin";
import { getSiteLogo, saveSiteLogo } from "@/lib/logo/store";

export async function GET() {
  return NextResponse.json(await getSiteLogo());
}

export async function POST(req: Request) {
  const auth = await requireAdminSession();
  if (auth instanceof NextResponse) return auth;
  const form = await req.formData();
  const file = form.get("logo");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File logo mancante" }, { status: 400 });
  }

  const isImage =
    file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".svg");

  if (!isImage) {
    return NextResponse.json({ error: "Formato non valido" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveSiteLogo(buffer, file.name);
  revalidatePath("/", "layout");

  return NextResponse.json(saved);
}
