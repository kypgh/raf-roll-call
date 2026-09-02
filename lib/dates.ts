import { Weekday } from "./types";

const WEEKDAY_NAMES: Weekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Parses a "YYYY-MM-DD" string as a LOCAL calendar date (not UTC), so it
// matches what the person actually picked, regardless of timezone.
export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function weekdayOf(dateStr: string): Weekday {
  return WEEKDAY_NAMES[parseDateOnly(dateStr).getDay()];
}

export function todayString(): string {
  return formatDateOnly(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateOnly(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateOnly(d);
}

// Human-friendly label, e.g. "Monday, Jun 9"
export function friendlyDate(dateStr: string): string {
  const d = parseDateOnly(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// "16:00:00" -> "4:00 PM"
export function friendlyTime(time: string | null): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function nextSevenDays(): string[] {
  const today = todayString();
  return Array.from({ length: 7 }, (_, i) => addDays(today, i));
}

// How many whole days `dateStr` is after today (negative = in the past).
export function daysFromToday(dateStr: string): number {
  const ms = parseDateOnly(dateStr).getTime() - parseDateOnly(todayString()).getTime();
  return Math.round(ms / 86_400_000);
}

// "3 days ago" / "In 8 days" / "Yesterday" / "Tomorrow" -- used in Day Sheet
// subtitles and owed-lesson rows.
export function relativeDayLabel(dateStr: string): string {
  const diff = daysFromToday(dateStr);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return diff > 0 ? `In ${diff} days` : `${Math.abs(diff)} days ago`;
}

// Short label used for "Missed Jun 5" style copy in the owed list/profile.
export function friendlyShortDate(dateStr: string): string {
  const d = parseDateOnly(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
