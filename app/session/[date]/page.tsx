import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { getOrCreateSessionForDate } from "@/lib/actions";
import { addDays, friendlyDate, friendlyTime, todayString, weekdayOf } from "@/lib/dates";
import SessionBoard from "@/components/SessionBoard";
import AddDropIn from "@/components/AddDropIn";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: {
  params: { date: string };
}) {
  const dateStr = params.date;
  const session = await getOrCreateSessionForDate(dateStr);

  const supabase = supabaseServer();
  const { data: rows } = await supabase
    .from("attendance")
    .select("id, status, confirmed, note, students(id, name)")
    .eq("session_id", session.id);

  const studentIds = (rows ?? [])
    .map((r: any) => r.students?.id)
    .filter((id: any): id is number => id != null);

  const { data: schedules } =
    studentIds.length > 0
      ? await supabase
          .from("student_schedules")
          .select("student_id, time")
          .eq("day", weekdayOf(dateStr))
          .in("student_id", studentIds)
      : { data: [] as { student_id: number; time: string }[] };

  const timeByStudent = new Map(
    (schedules ?? []).map((s: any) => [s.student_id, s.time])
  );

  const sorted = (rows ?? []).slice().sort((a: any, b: any) => {
    const ta = timeByStudent.get(a.students?.id) ?? "";
    const tb = timeByStudent.get(b.students?.id) ?? "";
    return ta.localeCompare(tb);
  });

  const scheduledIds = new Set(sorted.map((r: any) => r.students?.id));
  const { data: allStudents } = await supabase
    .from("students")
    .select("id, name")
    .eq("archived", false)
    .order("name", { ascending: true });
  const dropInCandidates = (allStudents ?? []).filter(
    (s) => !scheduledIds.has(s.id)
  );

  const isToday = dateStr === todayString();

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/session/${addDays(dateStr, -1)}`}
          className="no-underline flex items-center justify-center min-w-[44px] h-11 px-3.5 rounded-full bg-white border-2 border-line shadow-[0_3px_0_#F3E6D8] text-sm font-semibold text-muted2 whitespace-nowrap hover:border-purple hover:text-purple active:translate-y-0.5 active:shadow-none"
        >
          ← Prev
        </Link>
        <div className="text-center flex flex-col items-center gap-1">
          <span className="font-display font-semibold text-2xl leading-[1.1]">
            {friendlyDate(dateStr)}
          </span>
          {isToday && (
            <span className="font-display text-[11px] font-semibold tracking-[.08em] uppercase bg-purple text-white rounded-full px-2.5 py-[3px]">
              Today
            </span>
          )}
        </div>
        <Link
          href={`/session/${addDays(dateStr, 1)}`}
          className="no-underline flex items-center justify-center min-w-[44px] h-11 px-3.5 rounded-full bg-white border-2 border-line shadow-[0_3px_0_#F3E6D8] text-sm font-semibold text-muted2 whitespace-nowrap hover:border-purple hover:text-purple active:translate-y-0.5 active:shadow-none"
        >
          Next →
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">
          No one is scheduled on this day. You can still add a makeup student below.
        </p>
      ) : (
        <SessionBoard
          rows={sorted.map((r: any) => ({
            attendanceId: r.id,
            studentId: r.students?.id ?? 0,
            studentName: r.students?.name ?? "Unknown",
            studentTime: friendlyTime(timeByStudent.get(r.students?.id) ?? null),
            initialStatus: r.status,
            initialConfirmed: r.confirmed,
            initialNote: r.note ?? "",
            isDropIn: !timeByStudent.has(r.students?.id),
          }))}
        />
      )}

      <AddDropIn sessionId={session.id} candidates={dropInCandidates} />
    </div>
  );
}
