import {
  createSmtpTransporter,
  getSmtpFromAddress,
  getTradeInRecipient,
  SmtpNotConfiguredError,
} from "@/lib/email/smtp";

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
  let transporter;
  try {
    transporter = createSmtpTransporter();
  } catch (err) {
    if (err instanceof SmtpNotConfiguredError) {
      throw err;
    }
    throw err;
  }

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
    fieldLine("Versione / Allestimento", payload.version),
    fieldLine("Anno", payload.year),
    fieldLine("Chilometri", payload.mileage),
    fieldLine("Alimentazione", payload.fuel),
    fieldLine("Potenza CV", payload.powerCv),
    fieldLine("Prezzo richiesto", payload.requestedPrice),
    fieldLine("Data e ora richiesta", dateLabel),
    "",
    `Fotografie allegate: ${payload.attachments.length}`,
  ].join("\n");

  const fromUser = getSmtpFromAddress();
  const mailAttachments = payload.attachments.map((file) => ({
    filename: file.filename,
    content: file.content,
    contentType: file.contentType,
  }));

  try {
    await transporter.sendMail({
      from: `"Fierauto — Valutazione usato" <${fromUser}>`,
      to: getTradeInRecipient(),
      replyTo: payload.email,
      subject: `Valutazione usato — ${payload.brand} ${payload.model}`.trim(),
      text,
      attachments: mailAttachments,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[trade-in] SMTP sendMail failed", { message });
    throw new Error(
      "Invio email non riuscito. Verifica la connessione e riprova tra qualche minuto."
    );
  }
}

export { SmtpNotConfiguredError };
