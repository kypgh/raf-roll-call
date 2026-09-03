"use client";

import { useState, useTransition } from "react";
import { getFullHistoryExport } from "@/lib/actions";
import { STATUS_STYLE } from "@/lib/colors";

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export default function ExportHistoryButton() {
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function handleExport() {
    setFailed(false);
    startTransition(async () => {
      try {
        const rows = await getFullHistoryExport();

        const headers = ["Date", "Student", "Status", "Note"];
        const csv = [
          headers,
          ...rows.map((r) => [r.date, r.studentName, STATUS_STYLE[r.status].label, r.note ?? ""]),
        ]
          .map((row) => row.map((cell) => csvCell(cell)).join(","))
          .join("\r\n");

        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `history-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isPending}
      aria-label={failed ? "Export failed, try again" : "Export history to CSV"}
      className="w-10 h-10 rounded-full bg-[rgba(23,194,107,.16)] hover:bg-[rgba(23,194,107,.26)] border-2 border-[rgba(23,194,107,.4)] flex items-center justify-center text-green flex-none transition-colors disabled:opacity-60"
    >
      {isPending ? <SpinnerIcon /> : failed ? "!" : <ExportIcon />}
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

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-[16px] h-[16px] animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity=".25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
