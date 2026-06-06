import { NextResponse } from "next/server";
import { sendTradeInNotification } from "@/lib/email/tradeInNotification";
import { saveTradeInPhoto, saveTradeInSubmission } from "@/lib/tradein/store";

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"] as const;

function mimeForExt(ext: string): string {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

export async function POST(req: Request) {
  const form = await req.formData();

  const email = String(form.get("email") ?? "").trim();
  const brand = String(form.get("brand") ?? "").trim();
  const model = String(form.get("model") ?? "").trim();
  const version = String(form.get("version") ?? "").trim();
  const year = String(form.get("year") ?? "").trim();
  const mileage = String(form.get("mileage") ?? "").trim();
  const fuel = String(form.get("fuel") ?? "").trim();
  const powerCv = String(form.get("powerCv") ?? "").trim();
  const requestedPrice = String(form.get("requestedPrice") ?? "").trim();

  if (!email || !brand || !model || !year || !mileage) {
    return NextResponse.json({ error: "Compila tutti i campi obbligatori." }, { status: 400 });
  }

  const files = form.getAll("photos").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Carica almeno una foto del veicolo." }, { status: 400 });
  }

  const submissionId = `trade-${Date.now()}`;
  const createdAt = new Date();
  const photos: string[] = [];
  const emailAttachments: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      : ".jpg";
    const safeExt = (ALLOWED_EXT as readonly string[]).includes(ext) ? ext : ".jpg";
    const buffer = Buffer.from(await file.arrayBuffer());
    const savedPath = await saveTradeInPhoto(submissionId, buffer, safeExt, i);
    photos.push(savedPath);
    emailAttachments.push({
      filename: `${submissionId}-${i + 1}${safeExt}`,
      content: buffer,
      contentType: file.type || mimeForExt(safeExt),
    });
  }

  const submission = await saveTradeInSubmission({
    id: submissionId,
    email,
    brand,
    model,
    version,
    year,
    mileage,
    fuel,
    powerCv,
    requestedPrice,
    photos,
  });

  try {
    await sendTradeInNotification({
      email,
      brand,
      model,
      version,
      year,
      mileage,
      fuel,
      powerCv,
      requestedPrice,
      createdAt,
      attachments: emailAttachments,
    });
  } catch (err) {
    console.error("[trade-in] Invio email fallito", {
      id: submission.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Richiesta salvata ma invio email non riuscito. Riprova più tardi.",
      },
      { status: 500 }
    );
  }

  console.info("[trade-in] Richiesta permuta inviata", {
    id: submission.id,
    customerEmail: email,
    brand,
    model,
    photos: photos.length,
  });

  return NextResponse.json({
    ok: true,
    message: "Richiesta inviata. Riceverai una mail non appena la valutazione sarà visionata.",
    id: submission.id,
  });
}
