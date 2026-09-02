import Link from "next/link";

export function OwedRowBanner({ studentName }: { studentName: string }) {
  return (
    <Link
      href="/replace"
      className="no-underline flex items-center gap-3 bg-gold-light border-2 border-gold-border rounded-2xl px-4 py-3.5"
    >
      <span className="w-8 h-8 rounded-full bg-gold text-ink text-base font-bold flex items-center justify-center flex-none">
        ↻
      </span>
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span className="text-[15px] font-bold text-ink truncate">
          {studentName}&rsquo;s lesson needs replacing
        </span>
        <span className="text-[12px] font-semibold text-gold-text">
          Still open · in your replace list
        </span>
      </div>
      <span className="text-gold-text text-lg flex-none">›</span>
    </Link>
  );
}

export function TeacherOutHero({ count }: { count: number }) {
  const lessons = count === 1 ? "lesson" : "lessons";
  const pronoun = count === 1 ? "It" : "Both";
  return (
    <div className="flex items-start gap-3.5 bg-gold-light border-2 border-gold-border rounded-[22px] px-5 py-5">
      <span className="w-11 h-11 rounded-full bg-gold text-ink text-xl font-bold flex items-center justify-center flex-none">
        ↻
      </span>
      <div className="flex flex-col gap-1">
        <span className="font-display text-lg font-semibold text-ink">Nobody&rsquo;s at fault</span>
        <span className="text-sm font-medium text-gold-text2">
          {pronoun} {count === 1 ? "stays" : `${lessons} stay`} open. Tick {count === 1 ? "it" : "them"}{" "}
          off from your replace list when you&rsquo;ve given {count === 1 ? "it" : "them"} back.
        </span>
      </div>
    </div>
  );
}
