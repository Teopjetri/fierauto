import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getHeroImage, saveHeroImage } from "@/lib/hero/store";

export async function GET() {
  return NextResponse.json(await getHeroImage());
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File immagine mancante" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Formato non valido" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveHeroImage(buffer, file.name);
  revalidatePath("/");
  return NextResponse.json(saved);
}
