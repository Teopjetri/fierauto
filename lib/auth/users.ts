import { promises as fs } from "fs";
import path from "path";
import type { AdminUser, AdminUserRecord } from "@/lib/auth/types";
import { hashPassword } from "@/lib/auth/password";

const ADMIN_DIR = path.join(process.cwd(), "data", "admin");
const USERS_FILE = path.join(ADMIN_DIR, "users.json");

const DEFAULT_USERS: Array<{
  id: string;
  username: string;
  displayName: string;
  role: AdminUserRecord["role"];
  passwordEnv: string;
  fallbackPassword: string;
}> = [
  {
    id: "admin",
    username: "admin",
    displayName: "Admin — Fiera Auto",
    role: "owner",
    passwordEnv: "ADMIN_INITIAL_PASSWORD",
    fallbackPassword: "FierautoAdmin2026!",
  },
  {
    id: "developer",
    username: "developer",
    displayName: "Developer",
    role: "developer",
    passwordEnv: "DEVELOPER_INITIAL_PASSWORD",
    fallbackPassword: "FierautoDev2026!",
  },
];

export async function ensureAdminDir(): Promise<void> {
  await fs.mkdir(ADMIN_DIR, { recursive: true });
}

function toPublicUser(record: AdminUserRecord): AdminUser {
  return {
    id: record.id,
    username: record.username,
    displayName: record.displayName,
    role: record.role,
    active: record.active,
    createdAt: record.createdAt,
  };
}

async function seedInitialUsers(): Promise<AdminUserRecord[]> {
  const createdAt = new Date().toISOString();
  const users: AdminUserRecord[] = [];

  for (const seed of DEFAULT_USERS) {
    const password =
      process.env[seed.passwordEnv]?.trim() || seed.fallbackPassword;
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

  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  return users;
}

export async function getAdminUserRecords(): Promise<AdminUserRecord[]> {
  await ensureAdminDir();
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AdminUserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return seedInitialUsers();
  }
}

export async function findAdminUserByUsername(
  username: string
): Promise<AdminUserRecord | null> {
  const normalized = username.trim().toLowerCase();
  const users = await getAdminUserRecords();
  return (
    users.find(
      (user) => user.active && user.username.toLowerCase() === normalized
    ) ?? null
  );
}

export async function findAdminUserById(id: string): Promise<AdminUser | null> {
  const users = await getAdminUserRecords();
  const record = users.find((user) => user.active && user.id === id);
  return record ? toPublicUser(record) : null;
}
