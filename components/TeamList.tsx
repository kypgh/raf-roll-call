"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { avatarColor, initials, levelColor } from "@/lib/colors";
import { friendlyTime } from "@/lib/dates";
import { Weekday } from "@/lib/types";

type Student = {
  id: number;
  name: string;
  level_id: number | null;
  student_schedules: { day: string; time: string }[];
};
type Level = { id: number; name: string };

export default function TeamList({
  students,
  levels,
  todayWeekday,
}: {
  students: Student[];
  levels: Level[];
  todayWeekday: Weekday;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  function toggleSelectMode() {
    setSelectMode((on) => !on);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function goToMessage() {
    router.push(`/messages/new?ids=${Array.from(selectedIds).join(",")}`);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (levelFilter != null && s.level_id !== levelFilter) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, query, levelFilter]);

  const todayList = filtered
    .map((s) => ({ student: s, today: s.student_schedules.find((sc) => sc.day === todayWeekday) }))
    .filter((r) => r.today)
    .sort((a, b) => a.today!.time.localeCompare(b.today!.time));
  const restList = filtered.filter((s) => !s.student_schedules.some((sc) => sc.day === todayWeekday));

  const levelNameById = new Map(levels.map((l) => [l.id, l.name]));

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 text-center py-16">
        <span className="flex">
          <span className="w-[46px] h-[46px] rounded-full bg-purple-light2 -mr-3.5" />
          <span className="w-[46px] h-[46px] rounded-full bg-pink-light -mr-3.5" />
          <span className="w-[46px] h-[46px] rounded-full bg-green-light" />
        </span>
        <span className="font-display text-xl font-semibold">Nobody here yet</span>
        <p className="m-0 text-sm text-muted max-w-[300px]">
          Add your first student with their weekly slot and they&rsquo;ll appear on the rail
          straight away.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5 bg-white border-2 border-line rounded-2xl px-3.5 py-3">
        <span className="w-4 h-4 rounded-full border-2 border-[#B6ADC0] flex-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${students.length} students…`}
          className="flex-1 border-none outline-none bg-transparent text-[15px] placeholder:text-faint2"
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setLevelFilter(null)}
          className="text-xs font-bold rounded-full px-3.5 py-2 cursor-pointer border-none"
          style={{
            background: levelFilter == null ? "#241B2F" : "#FBF5EE",
            color: levelFilter == null ? "#FFFFFF" : "#5B5168",
          }}
        >
          All {students.length}
        </button>
        {levels.map((l) => {
          const color = levelColor(l.id);
          const count = students.filter((s) => s.level_id === l.id).length;
          if (count === 0) return null;
          const on = levelFilter === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevelFilter(on ? null : l.id)}
              className="text-xs font-bold rounded-full px-3.5 py-2 cursor-pointer border-none"
              style={{ background: on ? color.dot : color.bg, color: on ? "#FFFFFF" : color.text }}
            >
              {l.name} {count}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-[11px] font-bold tracking-[.1em] uppercase text-faint2 px-0.5">
          {todayList.length > 0 ? "Today" : "All students"}
        </span>
        <button
          type="button"
          onClick={toggleSelectMode}
          className="text-xs font-bold rounded-full px-3.5 py-1.5 cursor-pointer border-2"
          style={{
            background: selectMode ? "#241B2F" : "#FFFFFF",
            color: selectMode ? "#FFFFFF" : "#5B5168",
            borderColor: selectMode ? "#241B2F" : "#F3E6D8",
          }}
        >
          {selectMode ? "Cancel" : "Select"}
        </button>
      </div>

      {selectMode && (
        <div className="flex items-center gap-2.5 bg-purple-light2 border-2 border-purple-border rounded-2xl px-3.5 py-2.5">
          <span className="flex-1 text-[13px] font-bold text-purple-dark">
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            onClick={goToMessage}
            disabled={selectedIds.size === 0}
            className="text-[13px] font-bold rounded-full px-4 py-2 cursor-pointer border-none bg-purple text-white disabled:opacity-40 disabled:cursor-default"
          >
            Message
          </button>
        </div>
      )}

      {todayList.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {todayList.map(({ student, today }) => (
            <Row
              key={student.id}
              student={student}
              levelLabel={levelNameById.get(student.level_id ?? -1) ?? "No level"}
              sublabel={`Today ${friendlyTime(today!.time)}`}
              sublabelColor="#4A32C4"
              highlight
              selectMode={selectMode}
              selected={selectedIds.has(student.id)}
              onToggle={() => toggleSelected(student.id)}
            />
          ))}
        </div>
      )}

      {todayList.length > 0 && (
        <span className="text-[11px] font-bold tracking-[.1em] uppercase text-faint2 px-0.5 pt-1">
          Everyone else
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        {restList.map((student) => {
          const sched = student.student_schedules
            .map((sc) => `${sc.day.slice(0, 3)} ${friendlyTime(sc.time)}`)
            .join(" · ");
          return (
            <Row
              key={student.id}
              student={student}
              levelLabel={levelNameById.get(student.level_id ?? -1) ?? "No level"}
              sublabel={sched || "No fixed schedule"}
              selectMode={selectMode}
              selected={selectedIds.has(student.id)}
              onToggle={() => toggleSelected(student.id)}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted text-center py-6">No students match.</p>
      )}
    </div>
  );
}

function Row({
  student,
  levelLabel,
  sublabel,
  sublabelColor,
  highlight,
  selectMode,
  selected,
  onToggle,
}: {
  student: Student;
  levelLabel: string;
  sublabel: string;
  sublabelColor?: string;
  highlight?: boolean;
  selectMode?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const av = avatarColor(student.id);
  const lvl = levelColor(student.level_id);
  const content = (
    <>
      <span
        className="w-[38px] h-[38px] rounded-full text-[13px] font-bold flex items-center justify-center flex-none"
        style={{ background: av.bg, color: av.fg }}
      >
        {initials(student.name)}
      </span>
      <div className="flex-1 flex flex-col min-w-0">
        <span className="text-[15px] font-bold truncate">{student.name}</span>
        <span className="text-xs font-semibold" style={{ color: sublabelColor ?? "#7C7089" }}>
          {sublabel}
        </span>
      </div>
      {selectMode ? (
        <span
          className="w-5 h-5 rounded-full border-2 flex-none flex items-center justify-center text-[11px] font-bold text-white"
          style={{
            background: selected ? "#6B4EFF" : "transparent",
            borderColor: selected ? "#6B4EFF" : "#C9BFD4",
          }}
        >
          {selected ? "✓" : ""}
        </span>
      ) : (
        <span
          className="text-[11px] font-bold rounded-full px-2.5 py-1 flex-none"
          style={{ background: lvl.bg, color: lvl.text }}
        >
          {levelLabel}
        </span>
      )}
    </>
  );

  const className =
    "no-underline text-inherit flex items-center gap-3 bg-white rounded-[18px] px-3.5 py-2.5 transition-colors w-full text-left cursor-pointer";
  const style = { border: `2px solid ${highlight ? "#DED4FF" : "#F3E6D8"}` };

  if (selectMode) {
    return (
      <button type="button" onClick={onToggle} className={className} style={style}>
        {content}
      </button>
    );
  }

  return (
    <Link href={`/students/${student.id}?from=/team`} className={className} style={style}>
      {content}
    </Link>
  );
}
