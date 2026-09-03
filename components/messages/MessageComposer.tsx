"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMessageBatch } from "@/lib/actions";
import { avatarColor, initials } from "@/lib/colors";
import { MESSAGE_VARIABLES, resolveTemplate } from "@/lib/whatsapp";

export type ComposerCandidate = {
  studentId: number;
  name: string;
  parent: string;
  phone: string | null;
  age: string;
  level: string;
  time: string;
};

export default function MessageComposer({
  candidates,
  source,
  heading,
}: {
  candidates: ComposerCandidate[];
  source: string;
  heading: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState(new Set(candidates.map((c) => c.studentId)));
  const [template, setTemplate] = useState("Hi {{parent}}, ");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selected = candidates.filter((c) => selectedIds.has(c.studentId));
  const withPhone = selected.filter((c) => !!c.phone);
  const withoutPhone = selected.filter((c) => !c.phone);

  function removeCandidate(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function insertVariable(token: string) {
    const insert = `{{${token}}}`;
    const el = textareaRef.current;
    if (!el) {
      setTemplate((t) => t + insert);
      return;
    }
    const start = el.selectionStart ?? template.length;
    const end = el.selectionEnd ?? template.length;
    const next = template.slice(0, start) + insert + template.slice(end);
    setTemplate(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + insert.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function resolvedFor(c: ComposerCandidate) {
    return resolveTemplate(template, {
      name: c.name,
      parent: c.parent || c.name,
      age: c.age,
      level: c.level,
      time: c.time,
    });
  }

  function generate() {
    setError(null);
    if (withPhone.length === 0) {
      setError("None of the selected students have a phone number on file.");
      return;
    }
    startTransition(async () => {
      const recipients = selected.map((c) => ({
        studentId: c.studentId,
        name: c.name,
        parent: c.parent || null,
        phone: c.phone,
        message: resolvedFor(c),
      }));
      const res = await saveMessageBatch(template, source, recipients);
      if (!res.ok) {
        setError(res.error ?? "Couldn't save this message.");
        return;
      }
      router.push("/messages/last");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-semibold text-[26px] leading-[1.05] tracking-tight m-0">
          {heading}
        </h1>
        <p className="m-0 text-sm text-muted">
          {selected.length} {selected.length === 1 ? "student" : "students"} selected
        </p>
      </div>

      {candidates.length === 0 ? (
        <p className="text-sm text-muted">No students to message.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((c) => {
              const av = avatarColor(c.studentId);
              return (
                <span
                  key={c.studentId}
                  className="flex items-center gap-1.5 bg-white border-2 border-line rounded-full pl-1.5 pr-2.5 py-1"
                >
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-none"
                    style={{ background: av.bg, color: av.fg }}
                  >
                    {initials(c.name)}
                  </span>
                  <span className="text-[13px] font-bold">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => removeCandidate(c.studentId)}
                    aria-label={`Remove ${c.name}`}
                    className="w-4 h-4 rounded-full text-faint2 hover:text-red flex items-center justify-center flex-none cursor-pointer border-none bg-transparent text-xs"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[.07em] text-faint2">
              Insert
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MESSAGE_VARIABLES.map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => insertVariable(v.token)}
                  title={v.label}
                  className="text-xs font-bold rounded-full px-3 py-1.5 cursor-pointer border-none bg-purple-light2 text-purple-dark hover:bg-purple-border transition-colors"
                >
                  {`{{${v.token}}}`}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={4}
              placeholder="Hi {{parent}}, just a reminder about {{name}}'s lesson..."
              className="bg-white border-2 border-line rounded-2xl px-3.5 py-3 text-[15px] outline-none focus:border-purple resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[.07em] text-faint2">
              Preview
            </span>
            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-0.5">
              {selected.map((c) => (
                <div
                  key={c.studentId}
                  className="bg-white border-2 border-line rounded-2xl px-3.5 py-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold">{c.name}</span>
                    {!c.phone && (
                      <span className="text-[11px] font-bold text-red-text bg-red-light rounded-full px-2 py-0.5">
                        No phone on file
                      </span>
                    )}
                  </div>
                  <p className="m-0 text-sm text-muted2 whitespace-pre-wrap">{resolvedFor(c)}</p>
                </div>
              ))}
            </div>
          </div>

          {withoutPhone.length > 0 && (
            <p className="m-0 text-[13px] text-faint2">
              {withoutPhone.length} of {selected.length}{" "}
              {withoutPhone.length === 1 ? "student has" : "students have"} no phone number and
              will be skipped.
            </p>
          )}

          {error && <p className="m-0 text-sm text-red-text font-semibold">{error}</p>}

          <button
            type="button"
            onClick={generate}
            disabled={isPending || withPhone.length === 0}
            className="flex items-center justify-center gap-2 bg-green text-white rounded-full min-h-[52px] text-base font-bold shadow-[0_5px_0_#0E9A54] active:translate-y-[4px] active:shadow-none transition-transform border-none cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            {isPending ? "Saving…" : `Generate links for ${withPhone.length}`}
          </button>
        </>
      )}
    </div>
  );
}
