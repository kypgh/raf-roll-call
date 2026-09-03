"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { getRecentSessionDays, RailDay } from "@/lib/actions";
import { addDays, parseDateOnly, todayString } from "@/lib/dates";

const WEEKDAY_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function dayNum(dateStr: string): number {
  return parseDateOnly(dateStr).getDate();
}

function Dots({ stats }: { stats: { present: number; away: number; out: number } }) {
  const dots: string[] = [];
  if (stats.present > 0) dots.push("#17C26B");
  if (stats.away > 0) dots.push("#FF4B55");
  if (stats.out > 0) dots.push("#FFB020");
  if (dots.length === 0) return null;
  return (
    <span className="flex gap-[3px]">
      {dots.slice(0, 3).map((c, i) => (
        <span key={i} className="w-[5px] h-[5px] rounded-full" style={{ background: c }} />
      ))}
    </span>
  );
}

function Chip({
  date,
  isToday,
  isSelected,
  isFuture,
  stats,
  chipRef,
}: {
  date: string;
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
  stats: { present: number; away: number; out: number };
  chipRef?: React.Ref<HTMLAnchorElement>;
}) {
  const emphasized = isToday || isSelected;
  return (
    <Link
      ref={chipRef}
      href={`/day/${date}`}
      className="no-underline flex md:flex-col flex-row items-center justify-center gap-1 flex-none rounded-2xl px-3 py-2.5 md:py-3 transition-transform hover:-translate-y-0.5"
      style={{
        background: isToday ? "#6B4EFF" : emphasized ? "#FFF6EC" : "rgba(255,246,236,.06)",
        boxShadow: isToday ? "0 4px 0 #4A32C4" : "none",
        minWidth: 52,
      }}
    >
      <span
        className="text-[10px] font-bold tracking-[.06em] uppercase font-body"
        style={{ color: isToday ? "#F2EEFF" : emphasized ? "#7C7089" : isFuture ? "#D5CCE0" : "#8E8399" }}
      >
        {WEEKDAY_SHORT[parseDateOnly(date).getDay()]}
      </span>
      <span
        className="font-display font-semibold"
        style={{
          fontSize: emphasized ? 22 : 17,
          color: isToday ? "#FFFFFF" : emphasized ? "#241B2F" : isFuture ? "#D5CCE0" : "#8E8399",
        }}
      >
        {dayNum(date)}
      </span>
      <Dots stats={stats} />
    </Link>
  );
}

export default function DateRail({
  current,
  initialPast,
  todayStats,
}: {
  current: string;
  initialPast: RailDay[];
  todayStats: { present: number; away: number; out: number };
}) {
  const today = todayString();
  const [past, setPast] = useState<RailDay[]>(initialPast);
  const [exhausted, setExhausted] = useState(initialPast.length < 14);
  const [isPending, startTransition] = useTransition();
  const selectedRef = useRef<HTMLAnchorElement>(null);

  const future = Array.from({ length: 14 }, (_, i) => addDays(today, i + 1));

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [current]);

  function loadMore() {
    const oldest = past.length > 0 ? past[past.length - 1].date : today;
    startTransition(async () => {
      const more = await getRecentSessionDays(oldest, 14);
      if (more.length < 14) setExhausted(true);
      setPast((p) => [...p, ...more]);
    });
  }

  // Oldest-to-newest for display, regardless of rail orientation.
  const orderedPast = [...past].reverse();

  return (
    <div className="flex md:flex-col flex-row gap-2 overflow-x-auto md:overflow-x-hidden w-full px-1 py-1 -mx-1 md:mx-0">
      {!exhausted && (
        <button
          onClick={loadMore}
          disabled={isPending}
          className="flex-none self-center md:self-stretch text-[11px] font-bold text-rail-muted bg-transparent border-none cursor-pointer px-2 py-3 hover:text-white"
        >
          {isPending ? "…" : "‹ Earlier"}
        </button>
      )}
      {orderedPast.map((d) => (
        <Chip
          key={d.date}
          date={d.date}
          isToday={false}
          isSelected={d.date === current}
          isFuture={false}
          stats={d}
          chipRef={d.date === current ? selectedRef : undefined}
        />
      ))}
      <Chip
        date={today}
        isToday={true}
        isSelected={current === today}
        isFuture={false}
        stats={todayStats}
        chipRef={today === current ? selectedRef : undefined}
      />
      {future.map((date) => (
        <Chip
          key={date}
          date={date}
          isToday={false}
          isSelected={date === current}
          isFuture={true}
          stats={{ present: 0, away: 0, out: 0 }}
          chipRef={date === current ? selectedRef : undefined}
        />
      ))}
    </div>
  );
}
