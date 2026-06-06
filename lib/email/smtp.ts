import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

/** Destinatario fisso richieste permuta */
export const TRADE_IN_RECIPIENT = "fierauto2026@libero.it";

/** Provider predefinito: Libero Mail */
export const DEFAULT_SMTP_HOST = "smtp.libero.it";
export const DEFAULT_SMTP_PORT = 465;
export const DEFAULT_SMTP_USER = "fierauto2026@libero.it";

export class SmtpNotConfiguredError extends Error {
  constructor() {
    super("SMTP_NOT_CONFIGURED");
    this.name = "SmtpNotConfiguredError";
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
    user: process.env.SMTP_USER?.trim() || DEFAULT_SMTP_USER,
    pass,
  };
}

export function createSmtpTransporter(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
  const credentials = getSmtpCredentials();
  if (!credentials) {
    throw new SmtpNotConfiguredError();
  }

  const { host, port, user, pass } = credentials;
  const useImplicitTls = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: useImplicitTls,
    auth: { user, pass },
    requireTLS: !useImplicitTls,
    tls: {
      minVersion: "TLSv1.2",
    },
  });
}

export function getSmtpFromAddress(): string {
  const credentials = getSmtpCredentials();
  return credentials?.user || DEFAULT_SMTP_USER;
}
