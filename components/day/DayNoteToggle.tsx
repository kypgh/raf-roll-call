"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setDayNote } from "@/lib/actions";

// A pencil button that sits next to the day's title and reveals a small
// editor below it -- the day-level note ("hall was closed", "sub taught
// today") isn't shown until asked for, unlike a student's note which is
// always visible on their row.
export default function DayNoteToggle({
  date,
  initialNote,
  children,
}: {
  date: string;
  initialNote: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!initialNote?.trim());
  const [note, setNote] = useState(initialNote ?? "");
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);
  // Only steals focus when the user actually clicked the button to open it --
  // not when it opens on its own because the day already has a note.
  const userOpened = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    if (userOpened.current) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      userOpened.current = false;
    }
  }, [open]);

  function save(value: string) {
    const trimmed = value.trim();
    setNote(trimmed);
    startTransition(() => {
      setDayNote(date, trimmed);
    });
  }

  const hasNote = note.trim().length > 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        {children}
        <button
          type="button"
          onClick={() =>
            setOpen((o) => {
              const next = !o;
              if (next) userOpened.current = true;
              return next;
            })
          }
          aria-expanded={open}
          aria-label={hasNote ? "Edit the note for this day" : "Add a note for this day"}
          className={`relative flex-none w-9 h-9 rounded-full border-2 flex items-center justify-center text-[15px] transition-colors ${
            open
              ? "bg-purple border-purple text-white"
              : "bg-purple-light border-purple-border text-purple"
          }`}
        >
          ✎
          {hasNote && !open && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sky border-2 border-paper" />
          )}
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100 mt-2.5" : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="flex items-start gap-2.5 bg-purple-soft border-2 border-purple-border rounded-2xl px-4 py-3">
            <span className="select-none text-purple text-base leading-none flex-none mt-0.5">✎</span>
            <textarea
              ref={ref}
              value={note}
              rows={1}
              onChange={(e) => {
                setNote(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onBlur={(e) => save(e.target.value)}
              placeholder="Add a note for the day…"
              className="flex-1 min-w-0 resize-none bg-transparent text-[13px] text-ink outline-none placeholder:text-faint2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
