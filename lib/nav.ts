// Only ever used as a same-origin Link href, so a crafted `from` (e.g. a
// "javascript:" URL or an external "//host/…") must never pass through.
export function safeInternalPath(path: string | undefined | null, fallback: string): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("://") || path.includes("\\")) return fallback;
  return path;
}
