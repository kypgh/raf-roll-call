"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateAttendance } from "@/lib/actions";
import StatusDisc from "./StatusDisc";

// A pre-marked future absence isn't final -- this lets you undo it (clear
// back to "no answer yet") if the student ends up able to come after all.
export default function AwayStatusMenu({ attendanceId }: { attendanceId: number }) {
  const [cleared, setCleared] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  if (cleared) return null;

  function clear() {
    setCleared(true);
    setOpen(false);
    startTransition(async () => {
      await updateAttendance(attendanceId, { status: null });
    });
  }

  return (
    <div ref={rootRef} className="relative flex-none">
      <StatusDisc status="absent" size={28} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="absolute right-0 top-9 z-10 bg-white border-2 border-line rounded-2xl shadow-[0_4px_0_#F3E6D8] p-1.5 flex gap-1.5 w-[150px]">
          <span className="flex-1 min-h-[38px] rounded-xl text-[12px] font-bold flex items-center justify-center bg-red text-white">
            Away
          </span>
          <button
            type="button"
            onClick={clear}
            disabled={isPending}
            className="flex-1 min-h-[38px] rounded-xl text-[12px] font-bold border-2 border-line bg-white text-muted2 cursor-pointer hover:border-purple hover:text-purple"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
