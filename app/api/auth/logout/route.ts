import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import {
  clearAdminSessionCookieOptions,
  destroyAdminSession,
} from "@/lib/auth/session";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await destroyAdminSession(sessionId);
  }

  cookieStore.set(clearAdminSessionCookieOptions());
  return NextResponse.json({ ok: true });
}
