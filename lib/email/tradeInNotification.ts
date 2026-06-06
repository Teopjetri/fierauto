import {
  createSmtpTransporter,
  getSmtpAttemptPorts,
  getSmtpFromAddress,
  getTradeInRecipient,
  SmtpNotConfiguredError,
  SmtpTimeoutError,
  SMTP_SEND_TIMEOUT_MS,
  withTimeout,
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

  const mail = {
    from: `"Fierauto — Valutazione usato" <${fromUser}>`,
    to: getTradeInRecipient(),
    replyTo: payload.email,
    subject: `Valutazione usato — ${payload.brand} ${payload.model}`.trim(),
    text,
    attachments: mailAttachments,
  };

  let lastError: unknown;

  for (const port of getSmtpAttemptPorts()) {
    const transporter = createSmtpTransporter(port);
    try {
      await withTimeout(
        transporter.sendMail(mail),
        SMTP_SEND_TIMEOUT_MS,
        () => new SmtpTimeoutError()
      );
      transporter.close();
      return;
    } catch (err) {
      lastError = err;
      transporter.close();
      console.error("[trade-in] SMTP sendMail failed", {
        port,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (lastError instanceof SmtpTimeoutError) {
    throw new Error(
      "Invio email troppo lento. Riprova tra qualche minuto o contattaci telefonicamente."
    );
  }

  if (lastError instanceof SmtpNotConfiguredError) {
    throw lastError;
  }

  throw new Error(
    "Invio email non riuscito. Verifica la connessione e riprova tra qualche minuto."
  );
}

export { SmtpNotConfiguredError, SmtpTimeoutError };
