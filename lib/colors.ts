import { AttendanceStatus } from "./types";

function hashSeed(seed: number | string): number {
  if (typeof seed === "number") return seed;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

// Rotating palette used for per-student avatars. bg/shadow drive the little
// circle, fg is the initials color (most are white, gold reads better dark).
const AVATAR_PALETTE = [
  { bg: "#FF4FA3", shadow: "#C4126F", fg: "#fff" },
  { bg: "#12B5E5", shadow: "#0A7EA0", fg: "#fff" },
  { bg: "#FF7A45", shadow: "#A03A0F", fg: "#fff" },
  { bg: "#17C26B", shadow: "#0E9A54", fg: "#fff" },
  { bg: "#FFB020", shadow: "#C07C00", fg: "#241B2F" },
  { bg: "#6B4EFF", shadow: "#4A32C4", fg: "#fff" },
  { bg: "#8C5BFF", shadow: "#6438D6", fg: "#fff" },
  { bg: "#FF4B55", shadow: "#C22A33", fg: "#fff" },
];

export function avatarColor(seed: number | string) {
  return AVATAR_PALETTE[hashSeed(seed) % AVATAR_PALETTE.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Rotating palette for level pills/dots (Levels page + Students + Profile).
const LEVEL_PALETTE = [
  { dot: "#12B5E5", bg: "#E4F7FD", text: "#0A6E8C" },
  { dot: "#6B4EFF", bg: "#F2EEFF", text: "#4A32C4" },
  { dot: "#FF4FA3", bg: "#FFEFF7", text: "#B8146A" },
  { dot: "#FF7A45", bg: "#FFF0E8", text: "#A03A0F" },
  { dot: "#17C26B", bg: "#E6FAF0", text: "#0B7A45" },
  { dot: "#FFB020", bg: "#FFF4DF", text: "#8A5A00" },
];

export const NO_LEVEL_COLOR = { dot: "#C9BFD4", bg: "#F6F1EB", text: "#7C7089" };

export function levelColor(id: number | null | undefined) {
  if (id == null) return NO_LEVEL_COLOR;
  return LEVEL_PALETTE[hashSeed(id) % LEVEL_PALETTE.length];
}

// Amber ("gold") used to mean "late"; it now means "teacher was out / lesson
// owed" -- it keeps its slot in the palette so nothing needs relearning.
export const STATUS_STYLE: Record<
  AttendanceStatus,
  { label: string; on: string; onFg: string; dot: string; badgeBg: string; badgeText: string }
> = {
  present: { label: "Present", on: "#17C26B", onFg: "#FFFFFF", dot: "#17C26B", badgeBg: "#E6FAF0", badgeText: "#0B7A45" },
  absent: { label: "Away", on: "#FF4B55", onFg: "#FFFFFF", dot: "#FF4B55", badgeBg: "#FFF0F0", badgeText: "#A81C25" },
  teacher_absent: { label: "I was out", on: "#FFB020", onFg: "#241B2F", dot: "#FFB020", badgeBg: "#FFF4DF", badgeText: "#8A5A00" },
};

export const NAV_ACCENT: Record<string, string> = {
  Day: "#6B4EFF",
  Students: "#FF4FA3",
  Levels: "#12B5E5",
  Replace: "#FFB020",
};
