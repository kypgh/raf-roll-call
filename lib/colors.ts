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

export const STATUS_STYLE: Record<
  AttendanceStatus,
  { label: string; on: string; onFg: string; dot: string; badgeBg: string; badgeText: string }
> = {
  present: { label: "Present", on: "#17C26B", onFg: "#FFFFFF", dot: "#17C26B", badgeBg: "#E6FAF0", badgeText: "#0B7A45" },
  absent: { label: "Absent", on: "#FF4B55", onFg: "#FFFFFF", dot: "#FF4B55", badgeBg: "#FFF0F0", badgeText: "#A81C25" },
  late: { label: "Late", on: "#FFB020", onFg: "#241B2F", dot: "#FFB020", badgeBg: "#FFF4DF", badgeText: "#8A5A00" },
};

export const NAV_ACCENT: Record<string, string> = {
  Week: "#6B4EFF",
  Students: "#FF4FA3",
  Levels: "#12B5E5",
  History: "#FF7A45",
};

// Per-weekday accent used on Week day cards (index = Date#getDay(), 0=Sunday).
const DAY_STYLE = [
  { accent: "#C05CFF", pillBg: "#F5E9FF", pillText: "#7A3FA0" }, // Sun
  { accent: "#6B4EFF", pillBg: "#F2EEFF", pillText: "#3A21C7" }, // Mon
  { accent: "#FF4FA3", pillBg: "#FFEFF7", pillText: "#B8146A" }, // Tue
  { accent: "#12B5E5", pillBg: "#E4F7FD", pillText: "#0A6E8C" }, // Wed
  { accent: "#17C26B", pillBg: "#E6FAF0", pillText: "#0B7A45" }, // Thu
  { accent: "#FFB020", pillBg: "#FFF4DF", pillText: "#8A5A00" }, // Fri
  { accent: "#FF7A45", pillBg: "#FFF0E8", pillText: "#A03A0F" }, // Sat
];
export function dayStyle(weekdayIndex: number) {
  return DAY_STYLE[weekdayIndex % DAY_STYLE.length];
}
