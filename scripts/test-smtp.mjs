#!/usr/bin/env node
/**
 * Test SMTP Libero — eseguire sul server dentro il container:
 *   docker compose exec app node scripts/test-smtp.mjs
 */
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST?.trim() || "smtp.libero.it";
const configuredPort = Number(process.env.SMTP_PORT?.trim() || "587");
const user = process.env.SMTP_USER?.trim() || "fierauto2026@libero.it";
const pass = process.env.SMTP_PASS?.trim();
const to = process.env.OWNER_EMAIL?.trim() || "fierauto2026@libero.it";
const ports = [...new Set([configuredPort, configuredPort === 465 ? 587 : 465])];
const TIMEOUT_MS = 12_000;

if (!pass) {
  console.error("SMTP_PASS non impostata nel container.");
  process.exit(1);
}

function createTransport(port) {
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    requireTLS: port !== 465,
    connectionTimeout: TIMEOUT_MS,
    greetingTimeout: TIMEOUT_MS,
    socketTimeout: 45_000,
    tls: { minVersion: "TLSv1.2", servername: host },
  });
}

async function withTimeout(promise, ms) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout dopo ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

let lastError;

for (const port of ports) {
  const transporter = createTransport(port);
  try {
    await withTimeout(transporter.verify(), TIMEOUT_MS);
    console.log("SMTP verify OK:", { host, port, user });
    const info = await withTimeout(
      transporter.sendMail({
        from: `"Fierauto Test" <${user}>`,
        to,
        subject: "Test SMTP Fierauto",
        text: "Test invio email permuta — configurazione OK.",
      }),
      45_000
    );
    console.log("Test email inviata:", info.messageId);
    transporter.close();
    process.exit(0);
  } catch (err) {
    lastError = err;
    console.error(`SMTP test fallito su porta ${port}:`, err.message);
    transporter.close();
  }
}

console.error("SMTP test fallito su tutte le porte:", lastError?.message);
process.exit(1);
