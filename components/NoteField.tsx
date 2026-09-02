"use client";

import { useEffect, useRef, useState, useTransition } from "react";

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// Collapsed to one truncated line by default; tapping it opens a real
// auto-growing textarea so a long, multi-line note is fully readable and
// editable instead of scrolling sideways in a single-line input. Shared by
// the Day Sheet's answered-student card and future-day rows -- anywhere a
// note can be attached to an attendance row.
export default function NoteField({
  initialNote,
  onSave,
  placeholder = "Add a note…",
}: {
  initialNote: string | null;
  onSave: (note: string) => unknown;
  placeholder?: string;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [savedNote, setSavedNote] = useState(initialNote ?? "");
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) autoGrow(ref.current);
  }, [editing]);

  function close() {
    const trimmed = note.trim();
    setNote(trimmed);
    setEditing(false);
    if (trimmed === savedNote) return;
    setSavedNote(trimmed);
    startTransition(() => {
      onSave(trimmed);
    });
  }

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={note}
        autoFocus
        rows={1}
        onChange={(e) => {
          setNote(e.target.value);
          autoGrow(e.target);
        }}
        onBlur={close}
        placeholder={placeholder}
        className="w-full resize-none bg-offwhite border-2 border-purple-light2 rounded-xl px-2.5 py-2 text-[13px] text-ink outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full text-left bg-transparent border-none outline-none truncate text-[13px] px-0 py-0.5 cursor-text"
    >
      {note ? <span className="text-muted2">{note}</span> : <span className="text-faint2">{placeholder}</span>}
    </button>
  );
}
