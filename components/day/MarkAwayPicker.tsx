"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { answerAttendance } from "@/lib/actions";

export default function MarkAwayPicker({
  date,
  candidates,
}: {
  date: string;
  candidates: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (candidates.length === 0) return null;

  function mark() {
    if (!selected) return;
    startTransition(async () => {
      await answerAttendance(date, Number(selected), "absent", { note: note.trim() || undefined });
      setSelected("");
      setNote("");
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[42px] bg-red-light border-2 border-red-border2 text-red-text rounded-full font-body text-[13px] font-bold cursor-pointer hover:border-red transition-colors px-4"
      >
        Mark someone away
      </button>
    );
  }

  return (
    <div className="bg-white border-2 border-line rounded-[20px] p-4 flex flex-col gap-2.5 w-full">
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="rc-input">
        <option value="">Choose a student…</option>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional) — e.g. mum called ahead"
        className="rc-input"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 min-h-[46px] border-2 border-line bg-white text-muted2 rounded-2xl font-body text-sm font-bold cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={mark}
          disabled={!selected || isPending}
          className="flex-1 min-h-[46px] border-none rounded-2xl bg-red text-white font-body text-[15px] font-bold cursor-pointer shadow-[0_3px_0_#C22A33] active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-default"
        >
          Mark away
        </button>
      </div>
    </div>
  );
}
