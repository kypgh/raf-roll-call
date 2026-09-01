"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addLevel, deleteLevel } from "@/lib/actions";
import { levelColor } from "@/lib/colors";

type Level = { id: number; name: string; studentCount: number };

export default function LevelsManager({ levels }: { levels: Level[] }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await addLevel(name);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setName("");
      router.refresh();
    });
  }

  function remove(id: number) {
    setConfirmingId(null);
    startTransition(async () => {
      await deleteLevel(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border-2 border-line rounded-[22px] shadow-[0_5px_0_#F3E6D8] p-[18px] flex flex-col gap-2.5">
        <form onSubmit={submit} className="flex gap-2 flex-wrap">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New level name…"
            className="flex-1 min-w-[180px] rc-input focus:border-sky"
          />
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="min-h-[48px] px-[22px] border-none rounded-2xl bg-sky text-white font-body text-base font-bold cursor-pointer shadow-[0_4px_0_#0A7EA0] active:translate-y-[3px] active:shadow-[0_1px_0_#0A7EA0] disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {error && (
          <div className="flex items-center gap-2.5 bg-red-light border-2 border-red-border rounded-2xl px-3 py-2.5">
            <span className="w-5 h-5 rounded-full bg-red text-white text-xs font-bold flex items-center justify-center flex-none">
              !
            </span>
            <span className="text-sm font-semibold text-red-text">{error}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {levels.map((l) => {
          const color = levelColor(l.id);
          const confirming = confirmingId === l.id;
          return confirming ? (
            <div
              key={l.id}
              className="bg-red-light border-2 border-red-border rounded-[20px] p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full" style={{ background: color.dot }} />
                <span className="text-base font-bold">{l.name}</span>
              </div>
              <span className="text-sm text-red-text2">
                Delete this level? The {l.studentCount} {l.studentCount === 1 ? "student" : "students"}{" "}
                using it will show &ldquo;No level&rdquo; — nothing else changes.
              </span>
              <div className="flex gap-2.5 flex-wrap">
                <button
                  onClick={() => setConfirmingId(null)}
                  className="flex-1 min-w-[110px] min-h-[46px] border-2 border-red-border bg-white text-muted2 rounded-2xl font-body text-[15px] font-bold cursor-pointer"
                >
                  Keep it
                </button>
                <button
                  onClick={() => remove(l.id)}
                  className="flex-1 min-w-[110px] min-h-[46px] border-none bg-red text-white rounded-2xl font-body text-[15px] font-bold cursor-pointer shadow-[0_4px_0_#C22A33] active:translate-y-[3px] active:shadow-[0_1px_0_#C22A33]"
                >
                  Delete level
                </button>
              </div>
            </div>
          ) : (
            <div
              key={l.id}
              className="flex items-center justify-between gap-3 bg-white border-2 border-line rounded-[20px] shadow-[0_4px_0_#F3E6D8] px-4 py-3.5"
            >
              <span className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full" style={{ background: color.dot }} />
                <span className="text-base font-bold">{l.name}</span>
                <span className="text-xs text-muted">
                  {l.studentCount} {l.studentCount === 1 ? "student" : "students"}
                </span>
              </span>
              <button
                onClick={() => setConfirmingId(l.id)}
                className="bg-transparent border-none font-body text-sm font-bold text-faint cursor-pointer px-2 py-1.5 hover:text-red"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
