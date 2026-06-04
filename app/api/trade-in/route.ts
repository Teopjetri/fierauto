import { NextResponse } from "next/server";
import { saveTradeInPhoto, saveTradeInSubmission } from "@/lib/tradein/store";

export async function POST(req: Request) {
  const form = await req.formData();

  const email = String(form.get("email") ?? "").trim();
  const brand = String(form.get("brand") ?? "").trim();
  const model = String(form.get("model") ?? "").trim();
  const year = String(form.get("year") ?? "").trim();

  if (!email || !brand || !model || !year) {
    return NextResponse.json({ error: "Compila tutti i campi obbligatori." }, { status: 400 });
  }

  const submissionId = `trade-${Date.now()}`;
  const photos: string[] = [];
  const files = form.getAll("photos").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Carica almeno una foto del veicolo." }, { status: 400 });
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      : ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext) ? ext : ".jpg";
    const buffer = Buffer.from(await file.arrayBuffer());
    photos.push(await saveTradeInPhoto(submissionId, buffer, safeExt, i));
  }

  const submission = await saveTradeInSubmission({
    id: submissionId,
    email,
    brand,
    model,
    year,
    photos,
  });

  // Notifica proprietario (log + hook futuro per servizio email)
  const ownerEmail = process.env.OWNER_EMAIL ?? "Matteo_pjetri@libero.it";
  console.info("[trade-in] Nuova richiesta permuta", {
    id: submission.id,
    ownerEmail,
    customerEmail: email,
    brand,
    model,
    year,
    photos: photos.length,
  });

  return NextResponse.json({
    ok: true,
    message: "Richiesta inviata. Riceverai una mail non appena la valutazione sarà visionata.",
    id: submission.id,
  });
}
