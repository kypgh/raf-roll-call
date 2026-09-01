export const AUTH_COOKIE = "attendance_session";

// Deliberately simple: the cookie just holds the access code itself, as an
// httpOnly cookie the browser never exposes to JS. There's no encryption or
// hashing here -- this is a light "don't stumble in by accident" gate for a
// personal tool, not real authentication. Middleware runs on Vercel's Edge
// runtime, which doesn't support Node's crypto module, so keeping this
// dependency-free also avoids that whole class of problem.

export function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  return token === process.env.ACCESS_CODE;
}

export function isCorrectCode(code: string): boolean {
  return code === process.env.ACCESS_CODE;
}
