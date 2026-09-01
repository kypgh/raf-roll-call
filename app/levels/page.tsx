import { supabaseServer } from "@/lib/supabase";
import LevelsManager from "@/components/LevelsManager";

export const dynamic = "force-dynamic";

export default async function LevelsPage() {
  const supabase = supabaseServer();
  const [{ data: levels }, { data: students }] = await Promise.all([
    supabase.from("levels").select("id, name").order("sort_order", { ascending: true }),
    supabase.from("students").select("level_id").eq("archived", false),
  ]);

  const counts = new Map<number, number>();
  for (const s of students ?? []) {
    if (s.level_id == null) continue;
    counts.set(s.level_id, (counts.get(s.level_id) ?? 0) + 1);
  }

  const levelsWithCounts = (levels ?? []).map((l) => ({
    ...l,
    studentCount: counts.get(l.id) ?? 0,
  }));

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-semibold text-[34px] leading-[1.1] tracking-tight m-0">
          Levels
        </h1>
        <p className="m-0 text-sm text-muted">
          Your own labels. Each gets a colour that follows the student everywhere.
        </p>
      </div>
      <LevelsManager levels={levelsWithCounts} />
    </div>
  );
}
