import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { nextSevenDays, weekdayOf, friendlyDate, friendlyTime, todayString, parseDateOnly } from "@/lib/dates";
import { avatarColor, initials, dayStyle } from "@/lib/colors";

export const dynamic = "force-dynamic";

type ScheduleWithStudent = {
  day: string;
  time: string;
  students: { id: number; name: string; archived: boolean } | null;
};

export default async function WeekPage() {
  const supabase = supabaseServer();
  const { data: schedules } = await supabase
    .from("student_schedules")
    .select("day, time, students!inner(id, name, archived)")
    .eq("students.archived", false)
    .order("time", { ascending: true });

  const today = todayString();
  const days = nextSevenDays();

  const byDay = new Map<string, ScheduleWithStudent[]>();
  for (const dateStr of days) {
    const weekday = weekdayOf(dateStr);
    const matches = ((schedules ?? []) as any as ScheduleWithStudent[]).filter(
      (s) => s.day === weekday
    );
    byDay.set(dateStr, matches);
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-semibold text-[34px] leading-[1.1] tracking-tight m-0">
          This week
        </h1>
        <p className="m-0 text-sm text-muted">
          Seven days ahead. Tap a day to take the register.
        </p>
      </div>

      {days.map((dateStr) => {
        const list = byDay.get(dateStr) ?? [];
        const isToday = dateStr === today;
        const style = dayStyle(parseDateOnly(dateStr).getDay());
        const count = list.length;

        return (
          <Link
            key={dateStr}
            href={`/session/${dateStr}`}
            className={
              isToday
                ? "block no-underline text-inherit bg-purple-light border-2 border-purple rounded-[24px] shadow-[0_5px_0_#D6CBFF] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_0_#D6CBFF] active:translate-y-0.5 active:shadow-[0_2px_0_#D6CBFF]"
                : "flex no-underline text-inherit bg-white border-2 border-line rounded-[24px] shadow-[0_5px_0_#F3E6D8] overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_0_#F3E6D8] active:translate-y-0.5 active:shadow-[0_2px_0_#F3E6D8]"
            }
          >
            {!isToday && (
              <span className="w-2 flex-none" style={{ background: style.accent }} />
            )}
            <div className={isToday ? "" : "flex-1 p-5"}>
              <div className="flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className="font-display font-semibold text-[22px]"
                    style={{ color: isToday ? "#3A21C7" : "#241B2F" }}
                  >
                    {friendlyDate(dateStr)}
                  </span>
                  {isToday && (
                    <span className="font-display text-xs font-semibold tracking-[.08em] uppercase bg-purple text-white rounded-full px-2.5 py-1">
                      Today
                    </span>
                  )}
                </div>
                {count > 0 ? (
                  <span
                    className="text-[13px] font-bold rounded-full px-[11px] py-[5px] whitespace-nowrap"
                    style={
                      isToday
                        ? { color: "#3A21C7", background: "#fff" }
                        : { color: style.pillText, background: style.pillBg }
                    }
                  >
                    {count} {count === 1 ? "student" : "students"}
                  </span>
                ) : (
                  <span className="text-[13px] font-bold text-muted bg-card2 rounded-full px-[11px] py-[5px] whitespace-nowrap">
                    0 students
                  </span>
                )}
              </div>

              {count > 0 ? (
                <div className="mt-3 flex flex-col gap-0.5">
                  {list.map((s, i) => {
                    const student = s.students!;
                    const av = avatarColor(student.id);
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2.5 py-[7px] ${
                          i > 0 ? (isToday ? "border-t-2 border-dashed border-[#DED4FF]" : "border-t-2 border-dashed border-line") : ""
                        }`}
                      >
                        <span
                          className="w-[30px] h-[30px] rounded-full text-xs font-bold flex items-center justify-center flex-none"
                          style={{ background: av.bg, color: av.fg }}
                        >
                          {initials(student.name)}
                        </span>
                        <span className="flex-1 text-base font-medium">{student.name}</span>
                        <span
                          className="text-[13px] font-semibold text-muted2 rounded-full px-2.5 py-1"
                          style={{ background: isToday ? "#fff" : "#FBF5EE" }}
                        >
                          {friendlyTime(s.time)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3 border-2 border-dashed border-[#EFE2D4] rounded-2xl p-3.5">
                  <span className="flex gap-1 flex-none">
                    <span className="w-3 h-3 rounded-full bg-orange-soft" />
                    <span className="w-3 h-3 rounded-full bg-pink-border" />
                    <span className="w-3 h-3 rounded-full bg-sky-soft" />
                  </span>
                  <span className="text-sm text-muted">
                    {isToday ? "No sessions scheduled today." : "No sessions scheduled."}
                  </span>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
