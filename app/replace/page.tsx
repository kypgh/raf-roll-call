import Link from "next/link";
import { getOwedLessons } from "@/lib/actions";
import { friendlyShortDate, todayString } from "@/lib/dates";
import { avatarColor, initials } from "@/lib/colors";
import OwedTickRow from "@/components/OwedTickRow";
import UndoMakeupButton from "@/components/UndoMakeupButton";

export const dynamic = "force-dynamic";

export default async function ReplacePage() {
  const { open, resolved } = await getOwedLessons();

  const now = new Date();
  const resolvedThisMonth = resolved.filter((r) => {
    const d = r.resolvedAt ? new Date(r.resolvedAt) : null;
    return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  return (
    <div className="max-w-[720px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display font-semibold text-[34px] leading-[1.1] tracking-tight m-0">
            To replace
          </h1>
          <p className="m-0 text-sm text-muted">
            {open.length === 0
              ? "All caught up"
              : `${open.length} lesson${open.length === 1 ? "" : "s"} still to give back`}
          </p>
        </div>
        {open.length > 0 && (
          <span className="font-display text-sm font-semibold bg-gold-light text-gold-text rounded-full px-3 py-1.5">
            {open.length}
          </span>
        )}
      </div>

      {open.length === 0 && resolved.length === 0 ? (
        <div className="border-2 border-dashed border-linesoft rounded-[26px] px-6 py-10 flex flex-col items-center gap-3 text-center">
          <span className="w-14 h-14 rounded-full bg-green-light text-green-darker text-2xl font-bold flex items-center justify-center">
            ✓
          </span>
          <span className="font-display text-lg font-semibold">Nothing owed</span>
          <p className="m-0 text-sm text-muted max-w-[340px]">
            Every lesson you&rsquo;ve missed has been made up. When you mark yourself out on a day,
            those lessons land here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 bg-gold-light border-2 border-gold-border rounded-2xl px-4 py-3.5">
            <span className="w-8 h-8 rounded-full bg-gold text-ink text-base font-bold flex items-center justify-center flex-none">
              ↻
            </span>
            <p className="m-0 text-[13px] font-semibold text-gold-text2">
              Every lesson you missed sits here until it&rsquo;s made up. Add them as a drop-in on any
              day and marking them present closes it — or just tick it off yourself.
            </p>
          </div>

          {open.length > 0 && (
            <>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[13px] font-bold text-muted uppercase tracking-[.05em]">Still owed</span>
                <span className="text-[13px] font-semibold text-faint2">Oldest first</span>
              </div>
              <div className="flex flex-col gap-2">
                {open.map((r, i) => (
                  <OwedTickRow
                    key={r.makeupId}
                    makeupId={r.makeupId}
                    studentId={r.studentId}
                    studentName={r.studentName}
                    missedDate={r.missedDate}
                    overdue={i < open.length - 1}
                  />
                ))}
              </div>
            </>
          )}

          {resolved.length > 0 && (
            <>
              <span className="text-[13px] font-bold text-muted uppercase tracking-[.05em] mt-1">
                Replaced · {resolvedThisMonth.length} this month
              </span>
              <div className="flex flex-col gap-2">
                {resolved.map((r) => (
                  <ResolvedRow key={r.makeupId} row={r} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <Link
        href={`/day/${todayString()}`}
        className="no-underline self-center mt-1.5 text-sm font-semibold text-muted hover:text-purple"
      >
        ← Back to today
      </Link>
    </div>
  );
}

function ResolvedRow({
  row,
}: {
  row: { makeupId: number; studentId: number; studentName: string; missedDate: string; resolvedAt: string | null };
}) {
  const av = avatarColor(row.studentId);
  return (
    <div className="flex items-center gap-3 bg-card2 rounded-2xl px-4 py-3.5">
      <span
        className="w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center flex-none grayscale"
        style={{ background: av.bg, color: av.fg }}
      >
        {initials(row.studentName)}
      </span>
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span className="text-[15px] font-bold truncate text-muted2">{row.studentName}</span>
        <span className="text-[12px] font-semibold text-faint">
          Missed {friendlyShortDate(row.missedDate)}
          {row.resolvedAt ? ` · made up ${friendlyShortDate(row.resolvedAt.slice(0, 10))}` : ""}
        </span>
      </div>
      <UndoMakeupButton makeupId={row.makeupId} />
    </div>
  );
}
