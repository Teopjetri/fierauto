import nodemailer from "nodemailer";

const DEFAULT_OWNER_EMAIL = "fierauto2026@libero.it";

export interface TradeInEmailPayload {
  email: string;
  brand: string;
  model: string;
  version: string;
  year: string;
  mileage: string;
  fuel: string;
  powerCv: string;
  requestedPrice: string;
  createdAt: Date;
  attachments: { filename: string; content: Buffer; contentType?: string }[];
}

function fieldLine(label: string, value: string): string {
  const trimmed = value.trim();
  return `${label}: ${trimmed || "—"}`;
}

export async function sendTradeInNotification(
  payload: TradeInEmailPayload
): Promise<void> {
  const ownerEmail = process.env.OWNER_EMAIL?.trim() || DEFAULT_OWNER_EMAIL;
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || "465");

  if (!host || !user || !pass) {
    throw new Error(
      "Servizio email non configurato. Contatta il concessionario telefonicamente."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const dateLabel = payload.createdAt.toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    dateStyle: "long",
    timeStyle: "short",
  });

  const text = [
    "Nuova richiesta di valutazione usato — Fierauto",
    "",
    fieldLine("Email utente", payload.email),
    fieldLine("Marca", payload.brand),
    fieldLine("Modello", payload.model),
    fieldLine("Versione", payload.version),
    fieldLine("Anno", payload.year),
    fieldLine("Chilometri", payload.mileage),
    fieldLine("Alimentazione", payload.fuel),
    fieldLine("Potenza CV", payload.powerCv),
    fieldLine("Prezzo richiesto", payload.requestedPrice),
    fieldLine("Data richiesta", dateLabel),
    "",
    `Fotografie allegate: ${payload.attachments.length}`,
  ].join("\n");

  await transporter.sendMail({
    from: `"Fierauto — Valutazione usato" <${user}>`,
    to: ownerEmail,
    replyTo: payload.email,
    subject: `Valutazione usato — ${payload.brand} ${payload.model}`.trim(),
    text,
    attachments: payload.attachments,
  });
}
