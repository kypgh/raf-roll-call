"use client";

import { useState } from "react";
import AttendanceCard from "./AttendanceCard";
import { AttendanceStatus } from "@/lib/types";

type Row = {
  attendanceId: number;
  studentId: number;
  studentName: string;
  studentTime: string;
  initialStatus: AttendanceStatus;
  initialConfirmed: boolean;
  initialNote: string;
  isDropIn: boolean;
};

export default function SessionBoard({ rows }: { rows: Row[] }) {
  const [reviewed, setReviewed] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(rows.map((r) => [r.attendanceId, r.initialConfirmed]))
  );
  const [removed, setRemoved] = useState<Set<number>>(new Set());

  const visible = rows.filter((r) => !removed.has(r.attendanceId));
  const total = visible.length;
  const done = visible.filter((r) => reviewed[r.attendanceId]).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="flex flex-col gap-4">
      {total > 0 && (
        <div className="bg-white border-2 border-line rounded-[20px] px-4 py-3.5 flex items-center gap-3.5">
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-sm font-bold">
              {done} of {total} reviewed
            </span>
            <div className="h-3 rounded-full bg-[#F6EDE3] overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6B4EFF,#FF4FA3)" }}
              />
            </div>
          </div>
          <span className="font-display text-[26px] font-semibold text-purple">{pct}%</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {visible.map((r) => (
          <AttendanceCard
            key={r.attendanceId}
            attendanceId={r.attendanceId}
            studentId={r.studentId}
            studentName={r.studentName}
            studentTime={r.studentTime}
            initialStatus={r.initialStatus}
            initialConfirmed={r.initialConfirmed}
            initialNote={r.initialNote}
            isDropIn={r.isDropIn}
            onReviewed={() =>
              setReviewed((s) => (s[r.attendanceId] ? s : { ...s, [r.attendanceId]: true }))
            }
            onRemoved={() =>
              setRemoved((s) => {
                const next = new Set(s);
                next.add(r.attendanceId);
                return next;
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
