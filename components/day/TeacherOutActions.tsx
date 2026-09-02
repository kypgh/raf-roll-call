"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markTeacherAbsentForDay, revertTeacherAbsentForDay } from "@/lib/actions";

export function ImOutTodayButton({ date, count }: { date: string; count: number }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function go() {
    startTransition(async () => {
      await markTeacherAbsentForDay(date);
      setConfirming(false);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="w-full bg-gold-light border-2 border-gold-border rounded-2xl p-3.5 flex flex-col gap-2.5">
        <span className="text-sm font-semibold text-gold-text2">
          Mark all {count} {count === 1 ? "student" : "students"} today as teacher_absent? Each
          one opens a makeup lesson you&rsquo;ll owe them.
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 min-h-[42px] border-2 border-gold-border bg-white text-gold-text2 rounded-xl font-body text-sm font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={go}
            disabled={isPending}
            className="flex-1 min-h-[42px] border-none bg-gold text-ink rounded-xl font-body text-sm font-bold cursor-pointer shadow-[0_3px_0_#C07C00] active:translate-y-0.5 active:shadow-none"
          >
            {isPending ? "Marking…" : "Yes, I'm out"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex-1 min-h-[46px] bg-gold-light border-2 border-gold-border text-gold-text rounded-2xl font-body text-[14px] font-bold cursor-pointer hover:border-gold transition-colors px-4"
    >
      I&rsquo;m out today
    </button>
  );
}

export function WasntOutAfterAllButton({ date }: { date: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function go() {
    startTransition(async () => {
      await revertTeacherAbsentForDay(date);
      setConfirming(false);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="bg-white border-2 border-line rounded-2xl p-3.5 flex flex-col gap-2.5">
        <span className="text-sm font-semibold text-muted2">
          Revert every row today and delete the makeups?
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 min-h-[42px] border-2 border-line bg-white text-muted2 rounded-xl font-body text-sm font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={go}
            disabled={isPending}
            className="flex-1 min-h-[42px] border-none bg-ink text-white rounded-xl font-body text-sm font-bold cursor-pointer shadow-[0_3px_0_#0F0A17] active:translate-y-0.5 active:shadow-none"
          >
            {isPending ? "Reverting…" : "Yes, revert"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="self-center bg-transparent border-none text-[13px] font-semibold text-faint cursor-pointer px-1 py-2 hover:text-ink"
    >
      ↩ I wasn&rsquo;t out after all
    </button>
  );
}
