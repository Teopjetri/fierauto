#!/usr/bin/env node
/**
 * Test SMTP Libero — eseguire sul server dentro il container:
 *   docker compose exec app node scripts/test-smtp.mjs
 */
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST?.trim() || "smtp.libero.it";
const port = Number(process.env.SMTP_PORT?.trim() || "465");
const user = process.env.SMTP_USER?.trim() || "fierauto2026@libero.it";
const pass = process.env.SMTP_PASS?.trim();
const to = process.env.OWNER_EMAIL?.trim() || "fierauto2026@libero.it";

if (!pass) {
  console.error("SMTP_PASS non impostata nel container.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  requireTLS: port !== 465,
  tls: { minVersion: "TLSv1.2" },
});

try {
  await transporter.verify();
  console.log("SMTP verify OK:", { host, port, user });
  const info = await transporter.sendMail({
    from: `"Fierauto Test" <${user}>`,
    to,
    subject: "Test SMTP Fierauto",
    text: "Test invio email permuta — configurazione OK.",
  });
  console.log("Test email inviata:", info.messageId);
} catch (err) {
  console.error("SMTP test fallito:", err.message);
  process.exit(1);
}
