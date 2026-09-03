import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { friendlyDate, todayString } from "@/lib/dates";
import { STATUS_STYLE } from "@/lib/colors";
import ExportHistoryButton from "@/components/ExportHistoryButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { before?: string };
}) {
  const supabase = supabaseServer();
  const today = todayString();

  let query = supabase
    .from("sessions")
    .select("id, date")
    .order("date", { ascending: false })
    .limit(PAGE_SIZE);

  query = searchParams.before ? query.lt("date", searchParams.before) : query.lte("date", today);

  const { data: sessions } = await query;
  const sessionIds = (sessions ?? []).map((s) => s.id);

  const { data: attendance } =
    sessionIds.length > 0
      ? await supabase
          .from("attendance")
          .select("id, session_id, status, note, students(id, name)")
          .in("session_id", sessionIds)
          .not("status", "is", null)
      : { data: [] as any[] };

  const bySession = new Map<number, any[]>();
  for (const row of attendance ?? []) {
    const list = bySession.get(row.session_id) ?? [];
    list.push(row);
    bySession.set(row.session_id, list);
  }
  for (const list of bySession.values()) {
    list.sort((a, b) => (a.students?.name ?? "").localeCompare(b.students?.name ?? ""));
  }

  const hasMore = (sessions ?? []).length === PAGE_SIZE;
  const oldestDate = sessions && sessions.length > 0 ? sessions[sessions.length - 1].date : null;

  return (
    <div className="bg-ink min-h-screen flex flex-col">
      <div className="flex items-center gap-2.5 px-[18px] md:px-7 pt-[18px] pb-3.5 flex-none">
        <span className="select-none font-display font-semibold text-xl text-paper flex-1">History</span>
        <ExportHistoryButton />
        <Link
          href={`/day/${today}`}
          aria-label="Close"
          className="no-underline w-10 h-10 rounded-full bg-[rgba(255,246,236,.08)] hover:bg-[rgba(255,246,236,.16)] border-2 border-[rgba(255,246,236,.4)] flex items-center justify-center text-[15px] text-[#BBB0C6] flex-none transition-colors"
        >
          ✕
        </Link>
      </div>

      <div className="flex-1 bg-paper rounded-t-[32px] px-[18px] md:px-7 pt-[18px] pb-14">
        <div className="max-w-[640px] mx-auto flex flex-col gap-4">
          {!sessions || sessions.length === 0 ? (
            <p className="text-sm text-muted">No sessions recorded yet.</p>
          ) : (
            sessions.map((s) => {
              const rows = bySession.get(s.id) ?? [];
              return (
                <div
                  key={s.id}
                  className="bg-white border-2 border-line rounded-[22px] px-5 py-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <Link
                      href={`/day/${s.date}`}
                      className="no-underline font-display font-semibold text-[19px] text-ink hover:text-purple"
                    >
                      {friendlyDate(s.date)}
                    </Link>
                    <span className="text-[12px] font-bold text-muted bg-card2 rounded-full px-2.5 py-1">
                      {rows.length} {rows.length === 1 ? "student" : "students"}
                    </span>
                  </div>

                  {rows.length === 0 ? (
                    <p className="m-0 text-sm text-muted">No attendance recorded.</p>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {rows.map((r, i) => {
                        const style = STATUS_STYLE[r.status as keyof typeof STATUS_STYLE];
                        return (
                          <div
                            key={r.id}
                            className={`flex items-start gap-2.5 py-2 ${
                              i > 0 ? "border-t-2 border-dashed border-line" : ""
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full mt-1.5 flex-none" style={{ background: style.dot }} />
                            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                              <span className="text-[15px] font-semibold">{r.students?.name ?? "Unknown"}</span>
                              {r.note && <span className="text-[13px] text-muted2">{r.note}</span>}
                            </div>
                            <span className="text-[12px] font-bold flex-none" style={{ color: style.badgeText }}>
                              {style.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {hasMore && oldestDate && (
            <Link
              href={`/history?before=${oldestDate}`}
              className="no-underline self-center mt-1.5 min-h-[48px] flex items-center px-[22px] rounded-full bg-white border-2 border-line text-ink text-[15px] font-bold hover:border-purple hover:text-purple"
            >
              Load older sessions →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
