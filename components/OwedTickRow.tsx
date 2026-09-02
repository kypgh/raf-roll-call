"use client";

import { useState, useTransition } from "react";
import { resolveMakeup, unresolveMakeup } from "@/lib/actions";
import { avatarColor, initials } from "@/lib/colors";
import { friendlyShortDate } from "@/lib/dates";

export default function OwedTickRow({
  makeupId,
  studentId,
  studentName,
  missedDate,
  overdue,
}: {
  makeupId: number;
  studentId: number;
  studentName: string;
  missedDate: string;
  overdue: boolean;
}) {
  const [resolved, setResolved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const av = avatarColor(studentId);

  function toggle() {
    const next = !resolved;
    setResolved(next);
    startTransition(async () => {
      await (next ? resolveMakeup(makeupId) : unresolveMakeup(makeupId));
    });
  }

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
      style={{
        background: "#FFFFFF",
        border: `2px solid ${resolved ? "#CBEEDC" : overdue ? "#FFE1AC" : "#F3E6D8"}`,
      }}
    >
      <span
        className="w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center flex-none"
        style={{ background: av.bg, color: av.fg }}
      >
        {initials(studentName)}
      </span>
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span
          className="text-[15px] font-bold truncate"
          style={{ textDecoration: resolved ? "line-through" : "none" }}
        >
          {studentName}
        </span>
        <span className="text-[12px] font-semibold" style={{ color: resolved ? "#0B7A45" : "#8A5A00" }}>
          {resolved ? "Marked replaced" : `Missed ${friendlyShortDate(missedDate)} · you were out`}
        </span>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-label={resolved ? "Undo" : "Mark replaced"}
        className="w-[38px] h-[38px] rounded-full flex items-center justify-center flex-none cursor-pointer transition-colors"
        style={{
          border: resolved ? "none" : "2px solid #E0D3C4",
          background: resolved ? "#17C26B" : "#FFFFFF",
          color: resolved ? "#FFFFFF" : "#C9BFD4",
        }}
      >
        ✓
      </button>
    </div>
  );
}
