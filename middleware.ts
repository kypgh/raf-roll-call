import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, isValidToken } from "./lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow the login page itself and its API route through.
  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!isValidToken(token)) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets -- manifest.webmanifest and
  // /icons are fetched by the OS/browser itself (e.g. installing the PWA
  // icon) with no login session, so they must stay reachable unauthenticated
  // just like favicon.ico already is.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)",
  ],
};
