"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateAttendance } from "@/lib/actions";
import { AttendanceStatus } from "@/lib/types";
import { avatarColor, initials } from "@/lib/colors";
import { friendlyTime } from "@/lib/dates";
import StatusDisc from "./StatusDisc";
import NoteField from "@/components/NoteField";

const EDIT_OPTIONS: { status: AttendanceStatus; label: string; border: string; on: string; onFg: string }[] = [
  { status: "present", label: "Present", border: "#CBEEDC", on: "#17C26B", onFg: "#FFFFFF" },
  { status: "absent", label: "Away", border: "#FFD3D6", on: "#FF4B55", onFg: "#FFFFFF" },
  { status: "teacher_absent", label: "I was out", border: "#FFE1AC", on: "#FFB020", onFg: "#241B2F" },
];

export default function DayStudentCard({
  attendanceId,
  studentId,
  studentName,
  time,
  status,
  note,
  isDropIn,
}: {
  attendanceId: number;
  studentId: number;
  studentName: string;
  time: string | null;
  status: AttendanceStatus;
  note: string | null;
  isDropIn: boolean;
}) {
  const [current, setCurrent] = useState(status);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const av = avatarColor(studentId);

  function pick(next: AttendanceStatus) {
    setCurrent(next);
    setOpen(false);
    startTransition(async () => {
      await updateAttendance(attendanceId, { status: next });
    });
  }

  return (
    <div
      className="bg-white rounded-[20px] px-4 py-4 flex flex-col gap-3 transition-colors"
      style={{ border: `2px solid ${open ? "#6B4EFF" : "#F3E6D8"}` }}
    >
      <div className="flex items-center gap-3">
        <Link
          href={`/students/${studentId}`}
          className="no-underline text-inherit flex items-center gap-3 flex-1 min-w-0"
        >
          <span
            className="select-none w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center flex-none"
            style={{ background: av.bg, color: av.fg }}
          >
            {initials(studentName)}
          </span>
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span className="select-none text-[16px] font-bold truncate">{studentName}</span>
            <span className="select-none text-[12px] font-semibold text-muted">
              {isDropIn ? "Drop-in" : friendlyTime(time)}
            </span>
          </div>
        </Link>
        <StatusDisc status={current} onClick={() => setOpen((o) => !o)} />
      </div>

      <NoteField
        initialNote={note}
        onSave={(next) => updateAttendance(attendanceId, { note: next || null })}
      />

      {open && (
        <div className="flex flex-col gap-2.5 pt-3" style={{ borderTop: "2px solid #F6EFE6" }}>
          <span className="text-[11px] font-bold uppercase tracking-[.07em] text-faint2">
            Change what happened
          </span>
          <div className="flex gap-2">
            {EDIT_OPTIONS.map((o) => {
              const on = current === o.status;
              return (
                <button
                  key={o.status}
                  onClick={() => pick(o.status)}
                  disabled={isPending}
                  className="flex-1 min-h-[42px] rounded-[13px] font-body text-[13px] font-bold cursor-pointer transition-transform active:translate-y-0.5"
                  style={{
                    border: `2px solid ${o.border}`,
                    background: on ? o.on : "#FFFFFF",
                    color: on ? o.onFg : "#5B5168",
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
