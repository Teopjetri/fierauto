import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getAdminSession } from "@/lib/auth/session";
import type { AdminUser } from "@/lib/auth/types";

export async function requireAdminSession(): Promise<AdminUser | NextResponse> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const session = await getAdminSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Sessione non valida" }, { status: 401 });
  }

  return session.user;
}
