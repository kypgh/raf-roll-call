import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { friendlyDate, friendlyTime } from "@/lib/dates";
import { avatarColor, initials, levelColor, STATUS_STYLE } from "@/lib/colors";
import ArchiveButton from "@/components/ArchiveButton";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const supabase = supabaseServer();

  const { data: student } = await supabase
    .from("students")
    .select("*, levels(name), student_schedules(day, time)")
    .eq("id", id)
    .maybeSingle();

  if (!student) notFound();

  const scheduleLabel =
    student.student_schedules && student.student_schedules.length > 0
      ? student.student_schedules
          .map((sc: any) => `${sc.day} ${friendlyTime(sc.time)}`)
          .join("  ·  ")
      : "No fixed schedule";

  const { data: history } = await supabase
    .from("attendance")
    .select("id, status, note, confirmed, sessions(date)")
    .eq("student_id", id)
    .order("id", { ascending: false });

  const sorted = (history ?? []).slice().sort((a: any, b: any) =>
    (b.sessions?.date ?? "").localeCompare(a.sessions?.date ?? "")
  );

  const av = avatarColor(student.id);
  const lvl = levelColor(student.level_id);

  const totalSessions = sorted.length;
  const absentCount = sorted.filter((h: any) => h.status === "absent").length;
  const lateCount = sorted.filter((h: any) => h.status === "late").length;
  const attendedCount = totalSessions - absentCount;
  const attendanceRate =
    totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : null;
  let currentStreak = 0;
  for (const h of sorted) {
    if (h.status === "absent") break;
    currentStreak++;
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-4">
      <Link
        href="/students"
        className="no-underline text-sm font-semibold text-muted self-start hover:text-purple"
      >
        ← All students
      </Link>

      <div className="flex items-start gap-3.5 flex-wrap">
        <span
          className="w-[68px] h-[68px] rounded-full font-display text-2xl font-semibold flex items-center justify-center flex-none"
          style={{ background: av.bg, color: av.fg, boxShadow: `0 4px 0 ${av.shadow}` }}
        >
          {initials(student.name)}
        </span>
        <div className="flex-1 min-w-[160px] flex flex-col gap-1.5">
          <h1 className="font-display font-semibold text-[34px] leading-[1.05] tracking-tight m-0">
            {student.name}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold rounded-full px-[11px] py-1"
              style={{ background: lvl.bg, color: lvl.text }}
            >
              {student.levels?.name ?? "No level"}
            </span>
            <span className="text-sm text-muted">{scheduleLabel}</span>
          </div>
        </div>
        <Link
          href={`/students/${id}/edit`}
          className="no-underline inline-flex items-center min-h-[44px] px-[18px] rounded-full bg-white border-2 border-line shadow-[0_4px_0_#F3E6D8] text-ink text-[15px] font-bold hover:border-purple hover:text-purple active:translate-y-[3px] active:shadow-[0_1px_0_#F3E6D8]"
        >
          Edit
        </Link>
      </div>

      {totalSessions > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile
            label="Attendance rate"
            value={`${attendanceRate}%`}
            accent="#6B4EFF"
          />
          <StatTile label="Session streak" value={String(currentStreak)} accent="#FF4FA3" />
          <StatTile
            label={totalSessions === 1 ? "Total session" : "Total sessions"}
            value={String(totalSessions)}
            accent="#12B5E5"
          />
          <div className="bg-white border-2 border-line rounded-[20px] shadow-[0_4px_0_#F3E6D8] px-4 py-3.5 flex flex-col gap-2">
            <span className="text-sm text-muted font-semibold">Absences &amp; lates</span>
            <div className="flex items-baseline gap-4">
              <span className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-semibold" style={{ color: STATUS_STYLE.absent.badgeText }}>
                  {absentCount}
                </span>
                <span className="text-xs text-muted">absent</span>
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-semibold" style={{ color: STATUS_STYLE.late.badgeText }}>
                  {lateCount}
                </span>
                <span className="text-xs text-muted">late</span>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-line rounded-[22px] shadow-[0_5px_0_#F3E6D8] px-5 py-4 flex flex-col">
        <Row label="Parent" value={student.parent} />
        <Row label="Phone" value={student.phone} />
        <Row label="Age" value={student.age} />
        <Row label="General notes" value={student.notes} />
      </div>

      <div className="flex items-center gap-2.5 mt-1.5">
        <h2 className="font-display font-semibold text-[22px] m-0">History</h2>
        <span className="h-0.5 flex-1 bg-line" />
        <span className="text-[13px] font-bold text-muted">
          {sorted.length} {sorted.length === 1 ? "session" : "sessions"}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No sessions recorded yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((h: any) => {
            const style = STATUS_STYLE[h.status as keyof typeof STATUS_STYLE];
            return (
              <div
                key={h.id}
                className="bg-white border-2 border-line rounded-[22px] shadow-[0_5px_0_#F3E6D8] px-[18px] py-[18px] flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-base font-bold">
                    {friendlyDate(h.sessions?.date ?? "")}
                  </span>
                  <span
                    className="flex items-center gap-[7px] text-[13px] font-bold rounded-full px-[11px] py-[5px]"
                    style={{ background: style.badgeBg, color: style.badgeText }}
                  >
                    <span className="w-[9px] h-[9px] rounded-full" style={{ background: style.dot }} />
                    {style.label}
                  </span>
                </div>
                {h.note ? (
                  <p className="m-0 text-sm text-muted2">{h.note}</p>
                ) : !h.confirmed ? (
                  <span className="text-xs font-bold text-faint bg-card2 rounded-full px-[9px] py-[3px] self-start">
                    Unreviewed
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-2.5 border-t-2 border-dashed border-line pt-[18px]">
        <ArchiveButton studentId={id} studentName={student.name} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 py-[9px] border-t-2 border-dashed border-line first:border-t-0">
      <span className="text-sm text-muted font-semibold">{label}</span>
      <span className="text-[15px] font-medium text-right">{value}</span>
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white border-2 border-line rounded-[20px] shadow-[0_4px_0_#F3E6D8] px-4 py-3.5 flex flex-col gap-1.5">
      <span className="text-sm text-muted font-semibold">{label}</span>
      <span className="font-display text-2xl font-semibold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}
