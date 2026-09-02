"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { answerAttendance, removeAttendance, DeckMember } from "@/lib/actions";
import { AttendanceStatus } from "@/lib/types";
import { avatarColor, initials } from "@/lib/colors";
import { friendlyDate, friendlyTime } from "@/lib/dates";

const NOTE_CHIPS = ["Great focus", "Homework done", "Struggled today"];

type Answered = { studentId: number; attendanceId: number; status: AttendanceStatus };

export default function RegisterDeck({
  date,
  initialQueue,
}: {
  date: string;
  initialQueue: DeckMember[];
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialQueue);
  const [order, setOrder] = useState(() => members.filter((m) => !m.answered).map((m) => m.studentId));
  const [sessionAnswers, setSessionAnswers] = useState<Answered[]>([]);
  const [history, setHistory] = useState<Answered[]>([]);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const wasResume = initialQueue.some((m) => m.answered);
  const totalStudents = members.length;
  const alreadyAnswered = initialQueue.filter((m) => m.answered).length;

  const currentId = order[0] ?? null;
  const current = currentId != null ? members.find((m) => m.studentId === currentId) ?? null : null;

  function answer(status: AttendanceStatus) {
    if (!current) return;
    startTransition(async () => {
      const res = await answerAttendance(date, current.studentId, status, {
        note: note.trim() || undefined,
      });
      if (!res.ok || !res.attendanceId) return;
      const entry: Answered = { studentId: current.studentId, attendanceId: res.attendanceId, status };
      setHistory((h) => [...h, entry]);
      setSessionAnswers((s) => [...s, entry]);
      setMembers((ms) =>
        ms.map((m) => (m.studentId === current.studentId ? { ...m, answered: { attendanceId: res.attendanceId!, status } } : m))
      );
      setOrder((o) => o.slice(1));
      setNote("");
    });
  }

  function skip() {
    setOrder((o) => (o.length > 1 ? [...o.slice(1), o[0]] : o));
    setNote("");
  }

  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    startTransition(async () => {
      await removeAttendance(last.attendanceId);
      setHistory((h) => h.slice(0, -1));
      setSessionAnswers((s) => s.slice(0, -1));
      setMembers((ms) => ms.map((m) => (m.studentId === last.studentId ? { ...m, answered: null } : m)));
      setOrder((o) => [last.studentId, ...o]);
    });
  }

  if (!current) {
    return (
      <Recap
        date={date}
        sessionAnswers={sessionAnswers}
        members={members}
        onDone={() => router.push(`/day/${date}`)}
      />
    );
  }

  const av = avatarColor(current.studentId);
  const remaining = order.length;
  const positionLabel = wasResume
    ? `${remaining} still to mark`
    : `Student ${totalStudents - remaining + 1} of ${totalStudents}`;

  return (
    <div className="bg-ink min-h-[calc(100vh-66px)] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-[420px] flex flex-col gap-5">
        {wasResume && (
          <div className="bg-purple-light border-2 border-purple-border rounded-2xl px-4 py-3 text-center">
            <span className="text-[13px] font-semibold text-purple-dark">
              Picking up where you left off — only the unmarked
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#D5CCE0] flex-1 min-w-0 truncate">{friendlyDate(date)}</span>
          <span className="text-sm font-bold text-white flex-none">{positionLabel}</span>
          <Link
            href={`/day/${date}`}
            className="no-underline w-8 h-8 rounded-full bg-[rgba(255,246,236,.08)] hover:bg-[rgba(255,246,236,.16)] flex items-center justify-center text-[13px] text-[#BBB0C6] flex-none transition-colors"
            aria-label="Close register"
          >
            ✕
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {members.map((m) => {
            const mav = avatarColor(m.studentId);
            const isCurrent = m.studentId === current.studentId;
            const statusColor = m.answered
              ? m.answered.status === "present"
                ? "#17C26B"
                : m.answered.status === "absent"
                ? "#FF4B55"
                : "#FFB020"
              : null;
            return (
              <span
                key={m.studentId}
                className="w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center flex-none"
                style={{
                  background: statusColor ?? mav.bg,
                  color: statusColor ? "#241B2F" : mav.fg,
                  boxShadow: isCurrent ? "0 0 0 3px #6B4EFF" : "none",
                  opacity: m.answered && !isCurrent ? 0.85 : 1,
                }}
              >
                {initials(m.studentName)}
              </span>
            );
          })}
        </div>

        <div className="bg-paper rounded-[28px] px-6 py-8 flex flex-col items-center gap-4 text-center">
          <span
            className="w-20 h-20 rounded-full font-display text-2xl font-semibold flex items-center justify-center"
            style={{ background: av.bg, color: av.fg }}
          >
            {initials(current.studentName)}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-2xl font-semibold">{current.studentName}</span>
            <span className="text-sm text-muted">{friendlyTime(current.time)}</span>
          </div>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {NOTE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setNote((n) => (n === chip ? "" : chip))}
                className="text-[12px] font-bold rounded-full px-3 py-1.5 border-2 cursor-pointer transition-colors"
                style={{
                  borderColor: note === chip ? "#6B4EFF" : "#F3E6D8",
                  background: note === chip ? "#F2EEFF" : "#FFFFFF",
                  color: note === chip ? "#4A32C4" : "#5B5168",
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="w-full flex flex-col gap-2.5 mt-2">
            <button
              onClick={() => answer("present")}
              disabled={isPending}
              className="w-full min-h-[62px] rounded-2xl bg-green text-white font-body text-[19px] font-bold border-none cursor-pointer shadow-[0_5px_0_#0E9A54] active:translate-y-[4px] active:shadow-none transition-transform"
            >
              Present
            </button>
            <div className="flex gap-2.5">
              <button
                onClick={() => answer("absent")}
                disabled={isPending}
                className="flex-1 min-h-[56px] rounded-2xl bg-red text-white font-body text-[16px] font-bold border-none cursor-pointer shadow-[0_5px_0_#C22A33] active:translate-y-[4px] active:shadow-none transition-transform"
              >
                They&rsquo;re away
              </button>
              <button
                onClick={() => answer("teacher_absent")}
                disabled={isPending}
                className="flex-1 min-h-[56px] rounded-2xl bg-gold text-ink font-body cursor-pointer border-none shadow-[0_5px_0_#C07C00] active:translate-y-[4px] active:shadow-none transition-transform flex flex-col items-center justify-center leading-tight"
              >
                <span className="text-[16px] font-bold">I was out</span>
                <span className="text-[11px] font-bold opacity-[.66]">owes a lesson</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <button
            onClick={undo}
            disabled={history.length === 0 || isPending}
            className="bg-transparent border-none text-[#BBB0C6] text-sm font-semibold cursor-pointer disabled:opacity-40"
          >
            ↩ Undo
          </button>
          <button
            onClick={skip}
            disabled={order.length <= 1 || isPending}
            className="bg-transparent border-none text-[#BBB0C6] text-sm font-semibold cursor-pointer disabled:opacity-40"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
}

function Recap({
  date,
  sessionAnswers,
  members,
  onDone,
}: {
  date: string;
  sessionAnswers: Answered[];
  members: DeckMember[];
  onDone: () => void;
}) {
  const present = sessionAnswers.filter((a) => a.status === "present").length;
  const away = sessionAnswers.filter((a) => a.status === "absent").length;
  const out = sessionAnswers.filter((a) => a.status === "teacher_absent").length;
  const byId = new Map(members.map((m) => [m.studentId, m.studentName]));

  return (
    <div className="bg-ink min-h-[calc(100vh-66px)] flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-[420px] flex flex-col gap-5">
        <div className="flex flex-col gap-1 text-center">
          <span className="font-display text-2xl font-semibold text-white">All done</span>
          <span className="text-sm text-[#D5CCE0]">{friendlyDate(date)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <RecapTile label="Present" value={present} bg="#E6FAF0" text="#0B7A45" />
          <RecapTile label="Away" value={away} bg="#FFF0F0" text="#A81C25" />
          <RecapTile label="I was out" value={out} bg="#FFF4DF" text="#8A5A00" />
        </div>

        <div className="bg-paper rounded-[22px] p-3 flex flex-col gap-0.5">
          {sessionAnswers.map((a, i) => {
            const label = a.status === "present" ? "Present" : a.status === "absent" ? "Away" : "I was out · owed";
            return (
              <div
                key={a.studentId}
                className={`flex items-center justify-between py-2.5 px-2 ${i > 0 ? "border-t-2 border-dashed border-line" : ""}`}
              >
                <span className="text-[15px] font-semibold">{byId.get(a.studentId)}</span>
                <span className="text-[13px] font-bold text-muted2">{label}</span>
              </div>
            );
          })}
        </div>

        {out > 0 && (
          <Link
            href="/replace"
            className="no-underline flex items-center gap-3 bg-gold-light border-2 border-gold-border rounded-2xl px-4 py-3.5"
          >
            <span className="w-8 h-8 rounded-full bg-gold text-ink text-base font-bold flex items-center justify-center flex-none">
              ↻
            </span>
            <span className="flex-1 text-[14px] font-bold text-ink">
              {out} {out === 1 ? "lesson" : "lessons"} to replace — they&rsquo;re waiting in your list
            </span>
            <span className="text-gold-text text-lg flex-none">›</span>
          </Link>
        )}

        <button
          onClick={onDone}
          className="w-full min-h-[54px] rounded-2xl bg-purple text-white font-body text-[16px] font-bold border-none cursor-pointer shadow-[0_5px_0_#4A32C4] active:translate-y-[4px] active:shadow-none transition-transform"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function RecapTile({ label, value, bg, text }: { label: string; value: number; bg: string; text: string }) {
  return (
    <div className="rounded-[18px] px-3 py-3 flex flex-col gap-1" style={{ background: bg }}>
      <span className="font-display text-2xl font-semibold" style={{ color: text }}>
        {value}
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[.03em]" style={{ color: text }}>
        {label}
      </span>
    </div>
  );
}
