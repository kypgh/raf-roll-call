import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { friendlyDate, todayString } from "@/lib/dates";
import { STATUS_STYLE } from "@/lib/colors";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { before?: string };
}) {
  const supabase = supabaseServer();

  let query = supabase
    .from("sessions")
    .select("id, date, label")
    .order("date", { ascending: false })
    .limit(PAGE_SIZE);

  query = searchParams.before
    ? query.lt("date", searchParams.before)
    : query.lte("date", todayString());

  const { data: sessions } = await query;

  const sessionIds = (sessions ?? []).map((s) => s.id);

  const { data: attendance } =
    sessionIds.length > 0
      ? await supabase
          .from("attendance")
          .select("id, session_id, status, confirmed, note, students(id, name)")
          .in("session_id", sessionIds)
      : { data: [] as any[] };

  const bySession = new Map<number, any[]>();
  for (const row of attendance ?? []) {
    const list = bySession.get(row.session_id) ?? [];
    list.push(row);
    bySession.set(row.session_id, list);
  }
  for (const list of bySession.values()) {
    list.sort((a, b) =>
      (a.students?.name ?? "").localeCompare(b.students?.name ?? "")
    );
  }

  const hasMore = (sessions ?? []).length === PAGE_SIZE;
  const oldestDate =
    sessions && sessions.length > 0 ? sessions[sessions.length - 1].date : null;

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-semibold text-[34px] leading-[1.1] tracking-tight m-0">
          History
        </h1>
        <p className="m-0 text-sm text-muted">
          Every past session, most recent first.
        </p>
      </div>

      {!sessions || sessions.length === 0 ? (
        <p className="text-sm text-muted">No sessions recorded yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((s) => {
            const rows = bySession.get(s.id) ?? [];
            return (
              <div
                key={s.id}
                className="bg-white border-2 border-line rounded-[24px] shadow-[0_5px_0_#F3E6D8] p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <Link
                    href={`/session/${s.date}`}
                    className="no-underline font-display font-semibold text-[21px] text-ink hover:text-orange"
                  >
                    {friendlyDate(s.date)}
                  </Link>
                  <span className="text-[13px] font-bold text-muted bg-card2 rounded-full px-[11px] py-[5px]">
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
                          className={`flex items-start gap-2.5 py-[9px] ${
                            i > 0 ? "border-t-2 border-dashed border-line" : ""
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full mt-1.5 flex-none"
                            style={{ background: style.dot }}
                          />
                          <div className="flex-1 flex flex-col gap-0.5">
                            <span className="text-base font-semibold">
                              {r.students?.name ?? "Unknown"}
                            </span>
                            {r.note ? (
                              <span className="text-sm text-muted2">{r.note}</span>
                            ) : !r.confirmed ? (
                              <span className="text-xs font-bold text-faint bg-card2 rounded-full px-[9px] py-[3px] self-start">
                                Unreviewed
                              </span>
                            ) : null}
                          </div>
                          <span
                            className="text-[13px] font-bold flex-none"
                            style={{ color: style.badgeText }}
                          >
                            {style.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasMore && oldestDate && (
        <Link
          href={`/history?before=${oldestDate}`}
          className="no-underline self-center mt-1.5 min-h-[48px] flex items-center px-[22px] rounded-full bg-white border-2 border-line shadow-[0_4px_0_#F3E6D8] text-ink text-[15px] font-bold hover:border-orange hover:text-orange active:translate-y-[3px] active:shadow-[0_1px_0_#F3E6D8]"
        >
          Load older sessions →
        </Link>
      )}
    </div>
  );
}
