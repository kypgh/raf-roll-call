"use client";

import { useState, useTransition } from "react";
import { resolveMakeup, unresolveMakeup } from "@/lib/actions";
import { friendlyShortDate } from "@/lib/dates";

export default function OwedProfilePill({
  makeupId,
  missedDate,
}: {
  studentId: number;
  makeupId: number;
  missedDate: string;
}) {
  const [resolved, setResolved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !resolved;
    setResolved(next);
    startTransition(async () => {
      await (next ? resolveMakeup(makeupId) : unresolveMakeup(makeupId));
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="w-full flex items-center gap-2.5 rounded-full px-[13px] py-[7px] border-none cursor-pointer transition-colors"
      style={{
        background: resolved ? "#E6FAF0" : "#FFF4DF",
        border: `2px solid ${resolved ? "#CBEEDC" : "#FFE1AC"}`,
      }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center flex-none text-xs font-bold"
        style={{ background: resolved ? "#17C26B" : "#FFB020", color: resolved ? "#FFFFFF" : "#241B2F" }}
      >
        {resolved ? "✓" : "↻"}
      </span>
      <span className="flex-1 text-left text-[13px] font-bold" style={{ color: resolved ? "#0B7A45" : "#5B3A00" }}>
        {resolved ? `Replaced · ${friendlyShortDate(new Date().toISOString().slice(0, 10))}` : `1 lesson owed · you were out ${friendlyShortDate(missedDate)}`}
      </span>
      <span className="text-[13px] font-bold" style={{ color: resolved ? "#0B7A45" : "#5B3A00" }}>
        {resolved ? "Undo" : "Mark replaced"}
      </span>
    </button>
  );
}
