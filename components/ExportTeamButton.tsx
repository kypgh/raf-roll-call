"use client";

import { friendlyTime } from "@/lib/dates";

type Student = {
  id: number;
  name: string;
  level_id: number | null;
  parent: string | null;
  phone: string | null;
  age: number | null;
  notes: string | null;
  student_schedules: { day: string; time: string }[];
};
type Level = { id: number; name: string };

const WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function scheduleLabel(schedules: { day: string; time: string }[]): string {
  return schedules
    .slice()
    .sort((a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day))
    .map((s) => `${s.day.slice(0, 3)} ${friendlyTime(s.time)}`)
    .join(", ");
}

export default function ExportTeamButton({
  students,
  levels,
}: {
  students: Student[];
  levels: Level[];
}) {
  const levelNameById = new Map(levels.map((l) => [l.id, l.name]));

  function handleExport() {
    const headers = ["Name", "Parent", "Phone", "Age", "Level", "Schedule", "Notes"];
    const rows = students.map((s) => [
      s.name ?? "",
      s.parent ?? "",
      s.phone ?? "",
      s.age != null ? String(s.age) : "",
      s.level_id != null ? levelNameById.get(s.level_id) ?? "" : "",
      scheduleLabel(s.student_schedules ?? []),
      s.notes ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => csvCell(cell)).join(","))
      .join("\r\n");

    // Leading BOM so Excel (Windows/mobile) detects UTF-8 instead of mangling accents.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      aria-label="Export team to CSV"
      className="w-10 h-10 rounded-full bg-[rgba(23,194,107,.16)] hover:bg-[rgba(23,194,107,.26)] border-[1.5px] border-[rgba(23,194,107,.4)] flex items-center justify-center text-green flex-none transition-colors"
    >
      <ExportIcon />
    </button>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M12 15V3" />
      <path d="m7 10 5 5 5-5" />
      <path d="M20 21H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h3" />
      <path d="M20 14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1" />
    </svg>
  );
}
