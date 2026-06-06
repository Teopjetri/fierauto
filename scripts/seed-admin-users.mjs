#!/usr/bin/env node
/**
 * Rigenera data/admin/users.json con password da variabili d'ambiente.
 * Uso: ADMIN_INITIAL_PASSWORD=... DEVELOPER_INITIAL_PASSWORD=... node scripts/seed-admin-users.mjs
 */
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const scryptAsync = promisify(scrypt);
const adminDir = path.join(process.cwd(), "data", "admin");
const usersFile = path.join(adminDir, "users.json");

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

const seeds = [
  {
    id: "admin",
    username: "admin",
    displayName: "Admin — Fiera Auto",
    role: "owner",
    env: "ADMIN_INITIAL_PASSWORD",
    fallback: "FierautoAdmin2026!",
  },
  {
    id: "developer",
    username: "developer",
    displayName: "Developer",
    role: "developer",
    env: "DEVELOPER_INITIAL_PASSWORD",
    fallback: "FierautoDev2026!",
  },
];

const createdAt = new Date().toISOString();
const users = [];

for (const seed of seeds) {
  const password = process.env[seed.env]?.trim() || seed.fallback;
  users.push({
    id: seed.id,
    username: seed.username,
    displayName: seed.displayName,
    role: seed.role,
    active: true,
    createdAt,
    passwordHash: await hashPassword(password),
  });
}

await mkdir(adminDir, { recursive: true });
await writeFile(usersFile, JSON.stringify(users, null, 2), "utf-8");
console.log(`Admin users written to ${usersFile}`);
