import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

/** Destinatario fisso richieste permuta */
export const TRADE_IN_RECIPIENT = "fierauto2026@libero.it";

/** Provider predefinito: Libero Mail */
export const DEFAULT_SMTP_HOST = "smtp.libero.it";
export const DEFAULT_SMTP_PORT = 587;
export const SMTP_CONNECTION_TIMEOUT_MS = 12_000;
export const SMTP_SEND_TIMEOUT_MS = 45_000;

export class SmtpNotConfiguredError extends Error {
  constructor() {
    super("SMTP_NOT_CONFIGURED");
    this.name = "SmtpNotConfiguredError";
  }
}

export class SmtpTimeoutError extends Error {
  constructor() {
    super("SMTP_TIMEOUT");
    this.name = "SmtpTimeoutError";
  }
}

export function getTradeInRecipient(): string {
  return process.env.OWNER_EMAIL?.trim() || TRADE_IN_RECIPIENT;
}

export function getSmtpCredentials():
  | { host: string; port: number; user: string; pass: string }
  | null {
  const pass = process.env.SMTP_PASS?.trim();
  if (!pass) return null;

  return {
    host: process.env.SMTP_HOST?.trim() || DEFAULT_SMTP_HOST,
    port: Number(process.env.SMTP_PORT?.trim() || String(DEFAULT_SMTP_PORT)),
    user: process.env.SMTP_USER?.trim() || TRADE_IN_RECIPIENT,
    pass,
  };
}

function buildTransportOptions(
  credentials: { host: string; port: number; user: string; pass: string },
  port: number
): SMTPTransport.Options {
  const useImplicitTls = port === 465;

  return {
    host: credentials.host,
    port,
    secure: useImplicitTls,
    auth: {
      user: credentials.user,
      pass: credentials.pass,
    },
    requireTLS: !useImplicitTls,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    socketTimeout: SMTP_SEND_TIMEOUT_MS,
    tls: {
      minVersion: "TLSv1.2",
      servername: credentials.host,
    },
  };
}

export function createSmtpTransporter(
  portOverride?: number
): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
  const credentials = getSmtpCredentials();
  if (!credentials) {
    throw new SmtpNotConfiguredError();
  }

  const port = portOverride ?? credentials.port;
  return nodemailer.createTransport(buildTransportOptions(credentials, port));
}

export function getSmtpFromAddress(): string {
  const credentials = getSmtpCredentials();
  return credentials?.user || TRADE_IN_RECIPIENT;
}

export function getSmtpAttemptPorts(): number[] {
  const credentials = getSmtpCredentials();
  if (!credentials) return [];
  const primary = credentials.port;
  const fallback = primary === 465 ? 587 : 465;
  return [...new Set([primary, fallback])];
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorFactory: () => Error
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(errorFactory()), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function verifySmtpReady(): Promise<void> {
  const credentials = getSmtpCredentials();
  if (!credentials) {
    throw new SmtpNotConfiguredError();
  }

  let lastError: unknown;

  for (const port of getSmtpAttemptPorts()) {
    const transporter = createSmtpTransporter(port);
    try {
      await withTimeout(
        transporter.verify(),
        SMTP_CONNECTION_TIMEOUT_MS,
        () => new SmtpTimeoutError()
      );
      return;
    } catch (err) {
      lastError = err;
      transporter.close();
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Connessione SMTP non disponibile");
}
