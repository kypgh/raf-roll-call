"use client";

import { useState, useTransition } from "react";
import { updateAttendance, removeAttendance } from "@/lib/actions";
import { AttendanceStatus } from "@/lib/types";
import { avatarColor, initials, STATUS_STYLE } from "@/lib/colors";

const STATUSES: AttendanceStatus[] = ["present", "absent", "late"];

export default function AttendanceCard({
  attendanceId,
  studentId,
  studentName,
  studentTime,
  initialStatus,
  initialConfirmed,
  initialNote,
  isDropIn,
  onReviewed,
  onRemoved,
}: {
  attendanceId: number;
  studentId: number;
  studentName: string;
  studentTime: string;
  initialStatus: AttendanceStatus;
  initialConfirmed: boolean;
  initialNote: string;
  isDropIn?: boolean;
  onReviewed: () => void;
  onRemoved: () => void;
}) {
  const [status, setStatus] = useState<AttendanceStatus>(initialStatus);
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [confirming, setConfirming] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function setStatusAndConfirm(next: AttendanceStatus) {
    setStatus(next);
    setConfirmed(true);
    onReviewed();
    startTransition(async () => {
      await updateAttendance(attendanceId, { status: next, confirmed: true });
    });
  }

  function saveNoteIfChanged() {
    if (note === savedNote) return;
    setConfirmed(true);
    onReviewed();
    setSavedNote(note);
    startTransition(async () => {
      await updateAttendance(attendanceId, { note, confirmed: true });
    });
  }

  function doRemove() {
    setConfirming(false);
    setRemoved(true);
    onRemoved();
    startTransition(async () => {
      await removeAttendance(attendanceId);
    });
  }

  if (removed) return null;

  const av = avatarColor(studentId);

  return (
    <div
      className={`bg-white rounded-[24px] px-5 py-5 flex flex-col gap-3.5 transition-opacity ${
        isDropIn
          ? "border-2 border-dashed border-purple-border2 shadow-[0_5px_0_#F1ECFF]"
          : "border-2 border-line shadow-[0_5px_0_#F3E6D8]"
      }`}
      style={{ opacity: confirmed ? 1 : 0.62 }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-11 h-11 rounded-full text-[15px] font-bold flex items-center justify-center flex-none"
          style={{ background: av.bg, color: av.fg }}
        >
          {initials(studentName)}
        </span>
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-[17px] font-bold">{studentName}</span>
          {isDropIn ? (
            <span className="text-xs font-bold text-purple-dark bg-purple-light rounded-full px-2.5 py-[3px] self-start">
              Drop-in · makeup
            </span>
          ) : (
            <span className="text-[13px] text-muted">{studentTime}</span>
          )}
        </div>
        {!confirmed && (
          <span className="text-[11px] font-bold uppercase tracking-[.06em] text-faint bg-card2 rounded-full px-2.5 py-1.5">
            Not reviewed
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {STATUSES.map((s) => {
          const on = status === s;
          const style = STATUS_STYLE[s];
          return (
            <button
              key={s}
              onClick={() => setStatusAndConfirm(s)}
              className="flex-1 min-h-[46px] border-none rounded-2xl font-body text-[15px] font-bold cursor-pointer transition-transform active:translate-y-0.5"
              style={{ background: on ? style.on : "#FBF5EE", color: on ? style.onFg : "#6C6178" }}
            >
              {style.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={saveNoteIfChanged}
        placeholder="Notes for this session..."
        rows={2}
        className="rc-input"
      />

      {isDropIn && !confirming && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="self-end bg-transparent border-none text-[13px] font-semibold text-faint cursor-pointer px-0.5 py-1.5 hover:text-red"
        >
          Remove from this session
        </button>
      )}

      {isDropIn && confirming && (
        <div className="bg-red-light border-2 border-red-border rounded-2xl p-3.5 flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-red-text">
            Remove {studentName} from this session? Their earlier history stays put.
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 min-h-[42px] border-2 border-red-border bg-white text-muted2 rounded-xl font-body text-sm font-bold cursor-pointer"
            >
              Keep
            </button>
            <button
              onClick={doRemove}
              disabled={isPending}
              className="flex-1 min-h-[42px] border-none bg-red text-white rounded-xl font-body text-sm font-bold cursor-pointer shadow-[0_3px_0_#C22A33] active:translate-y-0.5 active:shadow-none"
            >
              Yes, remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
