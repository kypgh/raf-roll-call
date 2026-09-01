import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { friendlyTime } from "@/lib/dates";
import { avatarColor, initials, levelColor } from "@/lib/colors";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const supabase = supabaseServer();
  const { data: students } = await supabase
    .from("students")
    .select("*, levels(name), student_schedules(day, time)")
    .eq("archived", false)
    .order("name", { ascending: true });

  const count = students?.length ?? 0;

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display font-semibold text-[34px] leading-[1.1] tracking-tight m-0">
            Students
          </h1>
          <p className="m-0 text-sm text-muted">
            {count} active on the roster
          </p>
        </div>
        <Link
          href="/students/new"
          className="no-underline inline-flex items-center min-h-[46px] px-[18px] rounded-full bg-pink text-white text-[15px] font-bold shadow-[0_4px_0_#C4126F] transition-transform hover:-translate-y-px active:translate-y-[3px] active:shadow-[0_1px_0_#C4126F]"
        >
          + Add student
        </Link>
      </div>

      {count === 0 && (
        <p className="text-sm text-muted">No students yet. Add your first one above.</p>
      )}

      <div className="flex flex-col gap-3">
        {(students ?? []).map((s: any) => {
          const av = avatarColor(s.id);
          const lvl = levelColor(s.level_id);
          const schedules = s.student_schedules ?? [];
          return (
            <Link
              key={s.id}
              href={`/students/${s.id}`}
              className="no-underline text-inherit flex items-center gap-3.5 bg-white border-2 border-line rounded-[22px] shadow-[0_5px_0_#F3E6D8] p-[18px] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_0_#F3E6D8] hover:border-pink-border"
            >
              <span
                className="w-12 h-12 rounded-full text-base font-bold flex items-center justify-center flex-none"
                style={{ background: av.bg, color: av.fg }}
              >
                {initials(s.name)}
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[17px] font-bold">{s.name}</span>
                  <span
                    className="text-xs font-bold rounded-full px-2.5 py-[3px]"
                    style={{ background: lvl.bg, color: lvl.text }}
                  >
                    {s.levels?.name ?? "No level"}
                  </span>
                </div>
                <span className="text-sm text-muted">
                  {schedules.length > 0
                    ? schedules
                        .map((sc: any) => `${sc.day} · ${friendlyTime(sc.time)}`)
                        .join("  ·  ")
                    : "No fixed schedule"}
                </span>
              </div>
              <span className="text-faint2 text-xl flex-none">›</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
