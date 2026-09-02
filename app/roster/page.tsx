import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { todayString, weekdayOf } from "@/lib/dates";
import RosterList from "@/components/RosterList";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const supabase = supabaseServer();
  const [{ data: students }, { data: levels }] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, level_id, student_schedules(day, time)")
      .eq("archived", false)
      .order("name", { ascending: true }),
    supabase.from("levels").select("id, name").order("sort_order", { ascending: true }),
  ]);

  const today = todayString();
  const todayWeekday = weekdayOf(today);

  return (
    <div className="bg-ink min-h-screen flex flex-col">
      <div className="flex items-center gap-2.5 px-[18px] md:px-7 pt-[18px] pb-3.5 flex-none">
        <span className="font-display font-semibold text-xl flex-1">Roster</span>
        <Link
          href={`/day/${today}`}
          className="no-underline w-10 h-10 rounded-full bg-[rgba(255,246,236,.08)] hover:bg-[rgba(255,246,236,.16)] flex items-center justify-center text-[15px] text-[#BBB0C6] flex-none transition-colors"
        >
          ✕
        </Link>
      </div>

      <div className="flex-1 bg-paper rounded-t-[32px] px-[18px] md:px-7 pt-[18px] pb-28">
        <div className="max-w-[640px] mx-auto">
          <RosterList
            students={students ?? []}
            levels={levels ?? []}
            todayWeekday={todayWeekday}
          />
        </div>
      </div>

      <Link
        href="/students/new"
        className="no-underline fixed left-[18px] right-[18px] bottom-[18px] max-w-[640px] mx-auto flex items-center justify-center gap-2 bg-pink text-white rounded-full min-h-[56px] text-base font-bold shadow-[0_5px_0_#C4126F] active:translate-y-[4px] active:shadow-none transition-transform"
      >
        ＋ Add student
      </Link>
    </div>
  );
}
