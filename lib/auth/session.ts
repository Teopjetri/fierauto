import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import type { AdminSession, AdminUser } from "@/lib/auth/types";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { ensureAdminDir, findAdminUserById } from "@/lib/auth/users";

const SESSIONS_DIR = path.join(process.cwd(), "data", "admin", "sessions");

function sessionPath(id: string): string {
  return path.join(SESSIONS_DIR, `${id}.json`);
}

async function ensureSessionsDir(): Promise<void> {
  await ensureAdminDir();
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
}

export async function createAdminSession(userId: string): Promise<AdminSession> {
  await ensureSessionsDir();
  const now = new Date();
  const session: AdminSession = {
    id: randomBytes(32).toString("hex"),
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(
      now.getTime() + SESSION_MAX_AGE_SECONDS * 1000
    ).toISOString(),
  };
  await fs.writeFile(sessionPath(session.id), JSON.stringify(session), "utf-8");
  return session;
}

export async function getAdminSession(
  sessionId: string
): Promise<(AdminSession & { user: AdminUser }) | null> {
  if (!sessionId) return null;

  try {
    const raw = await fs.readFile(sessionPath(sessionId), "utf-8");
    const session = JSON.parse(raw) as AdminSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      await destroyAdminSession(sessionId);
      return null;
    }
    const user = await findAdminUserById(session.userId);
    if (!user) {
      await destroyAdminSession(sessionId);
      return null;
    }
    return { ...session, user };
  } catch {
    return null;
  }
}

export async function destroyAdminSession(sessionId: string): Promise<void> {
  try {
    await fs.unlink(sessionPath(sessionId));
  } catch {
    /* sessione già assente */
  }
}

export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;
  const session = await getAdminSession(sessionId);
  return session?.user ?? null;
}

export function adminSessionCookieOptions(sessionId: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function clearAdminSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
