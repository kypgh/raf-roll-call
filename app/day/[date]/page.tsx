import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { loadDaySheet, getRecentSessionDays, getOpenMakeupsCount, setNoteForDay } from "@/lib/actions";
import NoteField from "@/components/NoteField";
import {
  friendlyDate,
  friendlyTime,
  friendlyShortDate,
  relativeDayLabel,
  todayString,
} from "@/lib/dates";
import { avatarColor, initials } from "@/lib/colors";
import { isAnswered, AttendanceStatus } from "@/lib/types";
import DateRail from "@/components/day/DateRail";
import DayStudentCard from "@/components/day/DayStudentCard";
import StatTiles from "@/components/day/StatTiles";
import StatusDisc from "@/components/day/StatusDisc";
import AwayStatusMenu from "@/components/day/AwayStatusMenu";
import { OwedRowBanner, TeacherOutHero } from "@/components/day/OwedBanner";
import { ImOutTodayButton, WasntOutAfterAllButton } from "@/components/day/TeacherOutActions";
import DropInPicker from "@/components/day/DropInPicker";
import MarkAwayPicker from "@/components/day/MarkAwayPicker";
import RemoveDropInButton from "@/components/day/RemoveDropInButton";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: { params: { date: string } }) {
  const dateStr = params.date;
  const today = todayString();

  const supabase = supabaseServer();

  const [day, todayDay, pastDays, { data: allStudents }, owedCount] = await Promise.all([
    loadDaySheet(dateStr),
    dateStr === today ? Promise.resolve(null) : loadDaySheet(today),
    getRecentSessionDays(today, 14),
    supabase.from("students").select("id, name").eq("archived", false).order("name", { ascending: true }),
    getOpenMakeupsCount(),
  ]);

  const todayStats = todayDay
    ? { present: todayDay.present, away: todayDay.away, out: todayDay.out }
    : { present: day.present, away: day.away, out: day.out };
  const rowStudentIds = new Set(day.rows.map((r) => r.studentId));
  const dropInCandidates = (allStudents ?? []).filter((s) => !rowStudentIds.has(s.id));

  const times = day.rows.map((r) => r.time).filter((t): t is string => !!t);
  const timeRange =
    times.length > 0 ? `${friendlyTime(times[0])} to ${friendlyTime(times[times.length - 1])}` : null;

  return (
    <div className="bg-ink min-h-screen md:h-screen flex flex-col md:overflow-hidden">
      <div className="flex items-center gap-2.5 px-[18px] md:px-7 pt-[18px] md:pt-6 pb-3 flex-none">
        <img
          src="/icons/icon-192.png"
          alt="Boo Boo"
          className="select-none w-8 h-8 rounded-xl flex-none"
        />
        <span className="select-none font-display font-semibold text-xl text-paper flex-1 tracking-tight">Boo Boo</span>
        {owedCount > 0 && (
          <Link
            href="/replace"
            className="flex items-center gap-1.5 no-underline bg-gold hover:bg-gold-hover rounded-full pl-[9px] pr-[13px] py-2 transition-colors flex-none"
          >
            <span className="w-[22px] h-[22px] rounded-full bg-[rgba(36,27,47,.16)] text-ink text-xs font-bold flex items-center justify-center flex-none">
              ↻
            </span>
            <span className="font-display text-[15px] font-semibold text-ink">{owedCount}</span>
          </Link>
        )}
        <Link
          href="/team"
          className="flex items-center gap-2 no-underline bg-[rgba(255,246,236,.08)] border-2 border-[rgba(255,246,236,.4)] hover:bg-[rgba(255,246,236,.16)] rounded-full pl-2.5 pr-3.5 py-2 flex-none transition-colors"
        >
          <span className="flex">
            <span className="w-[22px] h-[22px] rounded-full bg-pink border-2 border-ink" />
            <span className="w-[22px] h-[22px] rounded-full bg-sky border-2 border-ink -ml-2.5" />
            <span className="w-[22px] h-[22px] rounded-full bg-green border-2 border-ink -ml-2.5" />
          </span>
          <span className="text-[13px] font-bold text-[#E4DDEC]">Team</span>
        </Link>
        {day.total > 0 && (
          <Link
            href={`/messages/new?date=${dateStr}`}
            aria-label="Message today's students"
            className="flex items-center justify-center no-underline w-10 h-10 rounded-full bg-green/10 border-2 border-green/30 hover:bg-green/20 flex-none transition-colors text-green"
          >
            <WhatsAppIcon className="w-[15px] h-[15px]" />
          </Link>
        )}
        <Link
          href="/history"
          aria-label="History"
          className="flex items-center justify-center no-underline w-10 h-10 rounded-full bg-sky/10 border-2 border-sky/30 hover:bg-sky/20 flex-none transition-colors"
        >
          <span className="relative w-[15px] h-[15px] rounded-full border-2 border-sky flex-none">
            <span className="absolute left-1/2 top-1/2 w-[1.5px] h-[5px] bg-sky rounded-full -translate-x-1/2 -translate-y-full origin-bottom" />
            <span className="absolute left-1/2 top-1/2 w-[4px] h-[1.5px] bg-sky rounded-full -translate-y-1/2 origin-left" />
          </span>
        </Link>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-0 md:overflow-hidden">
        <div className="md:w-[180px] md:flex-none md:h-full md:overflow-y-auto md:overflow-x-hidden px-3 md:px-3">
          <DateRail current={dateStr} initialPast={pastDays} todayStats={todayStats} />
        </div>

        <div className="flex-1 md:h-full md:overflow-y-auto bg-paper rounded-t-[32px] px-[18px] md:px-7 pt-6 pb-16">
          <div className="max-w-[640px] mx-auto flex flex-col gap-4">
            {day.mode === "empty" && <EmptyMode date={dateStr} candidates={dropInCandidates} />}
            {day.mode === "today" && (
              <TodayMode
                date={dateStr}
                isToday={dateStr === today}
                total={day.total}
                timeRange={timeRange}
                rows={day.rows}
                candidates={dropInCandidates}
              />
            )}
            {day.mode === "partial" && (
              <PartialMode
                date={dateStr}
                isToday={dateStr === today}
                answeredCount={day.answeredCount}
                total={day.total}
                rows={day.rows}
                candidates={dropInCandidates}
              />
            )}
            {day.mode === "past" && (
              <PastMode date={dateStr} isToday={dateStr === today} day={day} candidates={dropInCandidates} />
            )}
            {day.mode === "teacherout" && <TeacherOutMode date={dateStr} day={day} />}
            {day.mode === "future" && (
              <FutureMode
                date={dateStr}
                rows={day.rows}
                candidates={dropInCandidates}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display font-semibold text-[28px] md:text-[34px] leading-[1.05] tracking-tight m-0">
      {children}
    </h1>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "today" | "gold" | "neutral" }) {
  const style =
    tone === "today"
      ? { background: "#6B4EFF", color: "#FFFFFF" }
      : tone === "gold"
      ? { background: "#FFF4DF", color: "#8A5A00" }
      : { background: "#FBF5EE", color: "#5B5168" };
  return (
    <span
      className="font-display text-[11px] font-semibold tracking-[.06em] uppercase rounded-full px-2.5 py-1 self-start"
      style={style}
    >
      {children}
    </span>
  );
}

function StudentAvatarRow({
  studentId,
  studentName,
  time,
  date,
  subtitle,
  subtitleColor,
  right,
  borderColor,
  children,
}: {
  studentId: number;
  studentName: string;
  time: string | null;
  date?: string;
  subtitle?: string;
  subtitleColor?: string;
  right?: React.ReactNode;
  borderColor?: string;
  children?: React.ReactNode;
}) {
  const av = avatarColor(studentId);
  return (
    <div
      className="flex flex-col gap-2.5 rounded-[20px] px-4 py-4"
      style={{
        background: "#FFFFFF",
        border: `2px solid ${borderColor ?? "#F3E6D8"}`,
      }}
    >
      <div className="flex items-center gap-3">
        <Link
          href={date ? `/students/${studentId}?from=/day/${date}` : `/students/${studentId}`}
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
            <span
              className="select-none text-[12px] font-semibold"
              style={{ color: subtitleColor ?? "#7C7089" }}
            >
              {subtitle ?? (time ? friendlyTime(time) : "Drop-in")}
            </span>
          </div>
        </Link>
        {right}
      </div>
      {children}
    </div>
  );
}

// ---------- empty ----------

function EmptyMode({
  date,
  candidates,
}: {
  date: string;
  candidates: { id: number; name: string }[];
}) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <Title>{friendlyDate(date)}</Title>
        <p className="m-0 text-sm text-muted">Nothing scheduled today.</p>
      </div>
      <div className="border-2 border-dashed border-linesoft rounded-[26px] px-6 py-10 flex flex-col items-center gap-2 text-center">
        <span className="font-display text-lg font-semibold">A clear day</span>
        <p className="m-0 text-sm text-muted max-w-[320px]">
          Nobody&rsquo;s on the books. Add a drop-in if someone&rsquo;s coming in anyway.
        </p>
      </div>
      <DropInPicker date={date} candidates={candidates} label="＋ Add a drop-in" />
    </>
  );
}

// ---------- today ----------

function TodayMode({
  date,
  isToday,
  total,
  timeRange,
  rows,
  candidates,
}: {
  date: string;
  isToday: boolean;
  total: number;
  timeRange: string | null;
  rows: {
    attendanceId: number | null;
    studentId: number;
    studentName: string;
    time: string | null;
    isDropIn: boolean;
  }[];
  candidates: { id: number; name: string }[];
}) {
  const seconds = Math.max(10, total * 7);
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Title>{friendlyDate(date)}</Title>
        <p className="m-0 text-sm text-muted">
          {total} {total === 1 ? "lesson" : "lessons"}
          {timeRange ? ` · ${timeRange}` : ""} · none marked yet
        </p>
        {isToday ? (
          <Pill tone="today">Today</Pill>
        ) : (
          <Pill tone="neutral">Never registered · {relativeDayLabel(date)}</Pill>
        )}
      </div>

      <Link
        href={`/day/${date}/register`}
        className="no-underline flex items-center gap-3.5 bg-purple rounded-[26px] px-5 py-4 shadow-[0_6px_0_#4A32C4] transition-transform active:translate-y-[5px] active:shadow-none"
      >
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="font-display text-lg font-semibold text-white">Take the register</span>
          <span className="text-[13px] font-medium text-[#EAE3FF]">
            {total} {total === 1 ? "student" : "students"} · about {seconds} seconds
          </span>
        </div>
        <span className="w-[46px] h-[46px] rounded-full bg-white text-purple flex items-center justify-center flex-none text-xl">
          ▸
        </span>
      </Link>

      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <StudentAvatarRow
            key={r.studentId}
            studentId={r.studentId}
            studentName={r.studentName}
            time={r.time}
            date={date}
            right={
              r.isDropIn && r.attendanceId ? (
                <RemoveDropInButton attendanceId={r.attendanceId} />
              ) : (
                <span className="w-[30px] h-[30px] rounded-full border-2 border-dashed border-linedash flex-none" />
              )
            }
          />
        ))}
      </div>

      <div className="border-2 border-dashed border-linesoft rounded-2xl px-4 py-4 flex flex-col gap-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[.07em] text-faint2">Get ahead of it</span>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <DropInPicker date={date} candidates={candidates} />
          <ImOutTodayButton date={date} count={total} />
        </div>
      </div>
    </>
  );
}

// ---------- partial ----------

function PartialMode({
  date,
  isToday,
  answeredCount,
  total,
  rows,
  candidates,
}: {
  date: string;
  isToday: boolean;
  answeredCount: number;
  total: number;
  rows: {
    attendanceId: number | null;
    studentId: number;
    studentName: string;
    time: string | null;
    status: AttendanceStatus | null;
    note: string | null;
    isDropIn: boolean;
  }[];
  candidates: { id: number; name: string }[];
}) {
  const remaining = total - answeredCount;
  return (
    <>
      <div className="flex flex-col gap-1">
        <Title>{friendlyDate(date)}</Title>
        <p className="m-0 text-sm text-muted">
          {answeredCount} of {total} marked · you left in a hurry
        </p>
      </div>

      <Link
        href={`/day/${date}/register`}
        className="no-underline flex items-center gap-3.5 bg-purple rounded-[26px] px-5 py-4 shadow-[0_6px_0_#4A32C4] transition-transform active:translate-y-[5px] active:shadow-none"
      >
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="font-display text-lg font-semibold text-white">Finish the rest</span>
          <span className="text-[13px] font-medium text-[#EAE3FF]">
            {remaining} unmarked · skips the ones you did
          </span>
        </div>
        <span className="w-[46px] h-[46px] rounded-full bg-white text-purple flex items-center justify-center flex-none text-xl">
          ▸
        </span>
      </Link>

      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <DayStudentCard
            key={r.studentId}
            date={date}
            attendanceId={r.attendanceId}
            studentId={r.studentId}
            studentName={r.studentName}
            time={r.time}
            status={r.status}
            note={r.note}
            isDropIn={r.isDropIn}
          />
        ))}
      </div>

      {isToday && (
        <div className="border-2 border-dashed border-linesoft rounded-2xl px-4 py-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[.07em] text-faint2">Get ahead of it</span>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            <DropInPicker date={date} candidates={candidates} />
          </div>
        </div>
      )}
    </>
  );
}

// ---------- past ----------

function PastMode({
  date,
  isToday,
  day,
  candidates,
}: {
  date: string;
  isToday: boolean;
  day: Awaited<ReturnType<typeof loadDaySheet>>;
  candidates: { id: number; name: string }[];
}) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <Title>{friendlyDate(date)}</Title>
        <p className="m-0 text-sm text-muted">
          Registered {relativeDayLabel(date).toLowerCase()}
          {day.out > 0 ? ` · ${day.out} lesson${day.out === 1 ? "" : "s"} owed` : ""}
        </p>
      </div>

      <StatTiles present={day.present} away={day.away} out={day.out} />

      {day.out > 0 &&
        day.rows
          .filter((r) => r.status === "teacher_absent")
          .map((r) => <OwedRowBanner key={r.studentId} studentName={r.studentName} />)}

      <div className="flex flex-col gap-2.5">
        {day.rows.map((r) => {
          const status = r.status;
          return isAnswered(status) ? (
            <DayStudentCard
              key={r.studentId}
              date={date}
              attendanceId={r.attendanceId!}
              studentId={r.studentId}
              studentName={r.studentName}
              time={r.time}
              status={status}
              note={r.note}
              isDropIn={r.isDropIn}
            />
          ) : null;
        })}
      </div>

      {isToday && (
        <div className="border-2 border-dashed border-linesoft rounded-2xl px-4 py-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[.07em] text-faint2">Get ahead of it</span>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            <DropInPicker date={date} candidates={candidates} />
          </div>
        </div>
      )}

      <p className="m-0 text-center text-[13px] text-faint2">
        Tap any status to change it. Nothing else moves.
      </p>
    </>
  );
}

// ---------- teacherout ----------

function TeacherOutMode({
  date,
  day,
}: {
  date: string;
  day: Awaited<ReturnType<typeof loadDaySheet>>;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Title>{friendlyDate(date)}</Title>
          <p className="m-0 text-sm text-muted">
            You were out · {day.total} {day.total === 1 ? "lesson" : "lessons"} to replace
          </p>
        </div>
        <Pill tone="gold">I was out</Pill>
      </div>

      <TeacherOutHero count={day.total} />

      <div className="flex flex-col gap-2.5">
        {day.rows.map((r) => (
          <StudentAvatarRow
            key={r.studentId}
            studentId={r.studentId}
            studentName={r.studentName}
            time={r.time}
            date={date}
            subtitle={`${r.time ? friendlyTime(r.time) : "Drop-in"} · owed since ${friendlyShortDate(date)}`}
            subtitleColor="#8A5A00"
            right={<StatusDisc status="teacher_absent" size={30} />}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <WasntOutAfterAllButton date={date} />
      </div>
    </>
  );
}

// ---------- future ----------

function FutureMode({
  date,
  rows,
  candidates,
}: {
  date: string;
  rows: {
    attendanceId: number | null;
    studentId: number;
    studentName: string;
    time: string | null;
    status: AttendanceStatus | null;
    note: string | null;
    isDropIn: boolean;
    openMakeup: { makeupId: number; missedDate: string } | null;
  }[];
  candidates: { id: number; name: string }[];
}) {
  const allScheduled = rows.map((r) => ({ id: r.studentId, name: r.studentName }));
  return (
    <>
      <div className="flex flex-col gap-1">
        <Title>{friendlyDate(date)}</Title>
        <p className="m-0 text-sm text-muted">
          {relativeDayLabel(date)} · {rows.length} {rows.length === 1 ? "lesson" : "lessons"} booked
        </p>
        <Pill tone="neutral">Coming up</Pill>
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((r) => {
          const saveNote = setNoteForDay.bind(null, date, r.studentId);

          if (r.status === "absent") {
            return (
              <StudentAvatarRow
                key={r.studentId}
                studentId={r.studentId}
                studentName={r.studentName}
                time={r.time}
                date={date}
                right={
                  <div className="flex items-center gap-2 flex-none">
                    <AwayStatusMenu attendanceId={r.attendanceId!} />
                    {r.isDropIn && <RemoveDropInButton attendanceId={r.attendanceId!} />}
                  </div>
                }
              >
                <NoteField initialNote={r.note} onSave={saveNote} />
              </StudentAvatarRow>
            );
          }
          if (r.openMakeup) {
            return (
              <StudentAvatarRow
                key={r.studentId}
                studentId={r.studentId}
                studentName={r.studentName}
                time={r.time}
                date={date}
                borderColor="#FFE1AC"
                right={
                  <div className="flex items-center gap-2 flex-none">
                    <span className="text-xs font-bold text-gold-text bg-gold-light rounded-full px-2.5 py-1">
                      Makeup
                    </span>
                    {r.isDropIn && r.attendanceId && <RemoveDropInButton attendanceId={r.attendanceId} />}
                  </div>
                }
              >
                <div className="flex items-center gap-2.5 bg-gold-soft rounded-2xl px-3.5 py-2.5">
                  <span className="w-[22px] h-[22px] rounded-full bg-gold text-ink text-xs font-bold flex items-center justify-center flex-none">
                    ↻
                  </span>
                  <span className="text-[13px] font-semibold text-gold-text2">
                    Pays back the lesson missed on {friendlyShortDate(r.openMakeup.missedDate)} — marking
                    him present closes it.
                  </span>
                </div>
                <NoteField initialNote={r.note} onSave={saveNote} />
              </StudentAvatarRow>
            );
          }
          return (
            <StudentAvatarRow
              key={r.studentId}
              studentId={r.studentId}
              studentName={r.studentName}
              time={r.time}
              date={date}
              right={r.isDropIn && r.attendanceId ? <RemoveDropInButton attendanceId={r.attendanceId} /> : undefined}
            >
              <NoteField initialNote={r.note} onSave={saveNote} />
            </StudentAvatarRow>
          );
        })}
      </div>

      <div className="border-2 border-dashed border-linesoft rounded-2xl px-4 py-4 flex flex-col gap-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[.07em] text-faint2">Get ahead of it</span>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <DropInPicker date={date} candidates={candidates} label="＋ Add a one-off" />
          <MarkAwayPicker date={date} candidates={allScheduled} />
          <ImOutTodayButton date={date} count={rows.length} />
        </div>
      </div>

      <p className="m-0 text-center text-[13px] text-faint2">The register unlocks on the day itself.</p>
    </>
  );
}
