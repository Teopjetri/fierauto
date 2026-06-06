import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyPassword } from "@/lib/auth/password";
import { findAdminUserByUsername } from "@/lib/auth/users";
import {
  adminSessionCookieOptions,
  createAdminSession,
} from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = (await req.json()) as { username?: string; password?: string };
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username e password obbligatori." },
      { status: 400 }
    );
  }

  const user = await findAdminUserByUsername(username);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Credenziali non valide." },
      { status: 401 }
    );
  }

  const session = await createAdminSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieOptions(session.id));

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  });
}
