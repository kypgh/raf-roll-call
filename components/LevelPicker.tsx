"use client";

import { useState, useTransition } from "react";
import { addLevel } from "@/lib/actions";
import { levelColor } from "@/lib/colors";

type Level = { id: number; name: string };

export default function LevelPicker({
  levels,
  selectedId,
  onSelect,
  onLevelCreated,
}: {
  levels: Level[];
  selectedId: number | null;
  onSelect: (levelId: number | null) => void;
  onLevelCreated?: (level: Level) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function createLevel(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await addLevel(trimmed);
      setName("");
      setAdding(false);
      if (result.ok && result.id != null) onLevelCreated?.({ id: result.id, name: result.name! });
    });
  }

  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      {levels.map((l) => {
        const on = selectedId === l.id;
        const color = levelColor(l.id);
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onSelect(on ? null : l.id)}
            className="border-2 border-transparent rounded-full px-3.5 py-2 font-body text-[13px] font-bold cursor-pointer transition-transform active:translate-y-0.5"
            style={{ background: on ? color.dot : color.bg, color: on ? "#FFFFFF" : color.text }}
          >
            {l.name}
          </button>
        );
      })}

      {adding ? (
        <form onSubmit={createLevel} className="flex gap-1.5 items-center">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => !name.trim() && setAdding(false)}
            placeholder="Level name…"
            className="min-h-[38px] w-[140px] rounded-full border-2 border-line px-3 text-[13px] font-body outline-none focus:border-purple"
          />
          <button
            type="submit"
            disabled={!name.trim() || isPending}
            className="min-h-[38px] px-3 rounded-full border-none bg-purple text-white text-[13px] font-bold cursor-pointer disabled:opacity-40"
          >
            Add
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="border-2 border-dashed border-linedash bg-white text-muted rounded-full px-3.5 py-2 font-body text-[13px] font-bold cursor-pointer hover:border-purple hover:text-purple transition-colors"
        >
          ＋ New level
        </button>
      )}
    </div>
  );
}
