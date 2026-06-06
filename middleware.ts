import { NextRequest, NextResponse } from "next/server";
import { ADMIN_LOGIN_PATH, SESSION_COOKIE_NAME } from "@/lib/auth/constants";

function isProtectedAdminPage(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") &&
    pathname !== ADMIN_LOGIN_PATH &&
    !pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  );
}

function isProtectedAdminApi(pathname: string, method: string): boolean {
  if (pathname.startsWith("/api/listings")) return true;
  if (pathname.startsWith("/api/cars/")) return true;
  if (pathname.startsWith("/api/automotive/")) return true;
  if ((pathname === "/api/hero" || pathname === "/api/logo") && method !== "GET") {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (isProtectedAdminApi(pathname, request.method)) {
    if (!sessionId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (isProtectedAdminPage(pathname)) {
    if (!sessionId) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === ADMIN_LOGIN_PATH && sessionId) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/listings",
    "/api/listings/:path*",
    "/api/cars/:path*",
    "/api/automotive/:path*",
    "/api/hero",
    "/api/logo",
  ],
};
