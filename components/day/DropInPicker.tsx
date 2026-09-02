"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStudentToSession, getOpenMakeupsByStudent } from "@/lib/actions";
import { friendlyShortDate } from "@/lib/dates";

export default function DropInPicker({
  date,
  candidates,
  label = "＋ Someone else today",
}: {
  date: string;
  candidates: { id: number; name: string }[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [openMakeup, setOpenMakeup] = useState<{ makeupId: number; missedDate: string } | null>(null);
  const [linkMakeup, setLinkMakeup] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (candidates.length === 0) return null;

  function onSelect(id: string) {
    setSelected(id);
    setOpenMakeup(null);
    if (!id) return;
    startTransition(async () => {
      const map = await getOpenMakeupsByStudent([Number(id)]);
      setOpenMakeup(map.get(Number(id)) ?? null);
    });
  }

  function add() {
    if (!selected) return;
    startTransition(async () => {
      await addStudentToSession(
        date,
        Number(selected),
        linkMakeup ? openMakeup?.makeupId : undefined
      );
      setSelected("");
      setOpenMakeup(null);
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 min-h-[46px] bg-white border-2 border-line rounded-2xl font-body text-[14px] font-bold text-ink cursor-pointer hover:border-purple hover:text-purple transition-colors px-4"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="bg-white border-2 border-line rounded-[20px] p-4 flex flex-col gap-2.5 w-full">
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="rc-input"
      >
        <option value="">Choose a student…</option>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {openMakeup && (
        <label className="flex items-start gap-2.5 bg-gold-soft border-2 border-gold-border rounded-2xl px-3.5 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={linkMakeup}
            onChange={(e) => setLinkMakeup(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-[13px] font-semibold text-gold-text2">
            Pays back the lesson missed on {friendlyShortDate(openMakeup.missedDate)} — marking
            them present will close it.
          </span>
        </label>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 min-h-[46px] border-2 border-line bg-white text-muted2 rounded-2xl font-body text-sm font-bold cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={add}
          disabled={!selected || isPending}
          className="flex-1 min-h-[46px] border-none rounded-2xl bg-ink text-white font-body text-[15px] font-bold cursor-pointer shadow-[0_3px_0_#0F0A17] active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-default"
        >
          Add
        </button>
      </div>
    </div>
  );
}
