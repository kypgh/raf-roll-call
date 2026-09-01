import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, isCorrectCode } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (typeof code !== "string" || !isCorrectCode(code)) {
    return NextResponse.json({ ok: false, error: "Wrong code." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year -- this is a personal, low-security gate
  });
  return res;
}
