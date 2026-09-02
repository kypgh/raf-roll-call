"use client";

import { useState, useTransition } from "react";
import { setStudentLevel } from "@/lib/actions";
import LevelPicker from "@/components/LevelPicker";

type Level = { id: number; name: string };

export default function StudentLevelSection({
  studentId,
  levels: initialLevels,
  initialLevelId,
}: {
  studentId: number;
  levels: Level[];
  initialLevelId: number | null;
}) {
  const [levels, setLevels] = useState(initialLevels);
  const [levelId, setLevelId] = useState(initialLevelId);
  const [, startTransition] = useTransition();

  function select(id: number | null) {
    setLevelId(id);
    startTransition(async () => {
      await setStudentLevel(studentId, id);
    });
  }

  return (
    <div className="bg-white border-2 border-line rounded-[20px] p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold text-muted2">Level</span>
        <span className="text-xs text-faint2">Levels live here — no separate page</span>
      </div>
      <LevelPicker
        levels={levels}
        selectedId={levelId}
        onSelect={select}
        onLevelCreated={(l) => {
          setLevels((ls) => [...ls, l]);
          select(l.id);
        }}
      />
    </div>
  );
}
