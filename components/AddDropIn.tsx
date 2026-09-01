"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStudentToSession } from "@/lib/actions";

export default function AddDropIn({
  sessionId,
  candidates,
}: {
  sessionId: number;
  candidates: { id: number; name: string }[];
}) {
  const [selected, setSelected] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (candidates.length === 0) return null;

  function add() {
    if (!selected) return;
    startTransition(async () => {
      await addStudentToSession(sessionId, Number(selected));
      setSelected("");
      router.refresh();
    });
  }

  return (
    <div className="bg-white border-2 border-line rounded-[24px] p-5 flex flex-col gap-2.5 mt-1">
      <span className="font-display text-[17px] font-semibold">Add a drop-in</span>
      <div className="flex gap-2 flex-wrap">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 min-w-[180px] rc-input"
        >
          <option value="">Choose a student…</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={add}
          disabled={!selected || isPending}
          className="min-h-[48px] px-[22px] border-none rounded-2xl bg-ink text-white font-body text-[15px] font-bold cursor-pointer shadow-[0_3px_0_#0F0A17] active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-default"
        >
          Add
        </button>
      </div>
    </div>
  );
}
