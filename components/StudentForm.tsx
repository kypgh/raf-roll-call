"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addStudent, updateStudent, StudentInput, ScheduleInput } from "@/lib/actions";
import { WEEKDAYS } from "@/lib/types";
import LevelPicker from "@/components/LevelPicker";

type Level = { id: number; name: string };

export default function StudentForm({
  levels,
  studentId,
  studentName,
  initial,
}: {
  levels: Level[];
  studentId?: number;
  studentName?: string;
  initial?: Partial<StudentInput>;
}) {
  const router = useRouter();
  const [levelOptions, setLevelOptions] = useState(levels);
  const [form, setForm] = useState<StudentInput>({
    name: initial?.name ?? "",
    parent: initial?.parent ?? "",
    phone: initial?.phone ?? "",
    age: initial?.age ?? "",
    level_id: initial?.level_id ?? "",
    notes: initial?.notes ?? "",
    schedules:
      initial?.schedules && initial.schedules.length > 0
        ? initial.schedules
        : [{ day: "", time: "" }],
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof StudentInput>(key: K, value: StudentInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setSchedule(index: number, patch: Partial<ScheduleInput>) {
    setForm((f) => ({
      ...f,
      schedules: f.schedules.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function addScheduleRow() {
    setForm((f) => ({ ...f, schedules: [...f.schedules, { day: "", time: "" }] }));
  }

  function removeScheduleRow(index: number) {
    setForm((f) => ({
      ...f,
      schedules: f.schedules.filter((_, i) => i !== index),
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = studentId
        ? await updateStudent(studentId, form)
        : await addStudent(form);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push(studentId ? `/students/${studentId}` : "/roster");
      router.refresh();
    });
  }

  return (
    <div className="bg-ink min-h-screen flex flex-col">
      <div className="flex items-center gap-2.5 px-[18px] md:px-7 pt-[18px] pb-3.5 flex-none">
        <Link
          href={studentId ? `/students/${studentId}` : "/roster"}
          className="no-underline text-sm font-bold text-[#BBB0C6] hover:text-paper flex-1"
        >
          Cancel
        </Link>
        <span className="font-display text-[17px] font-semibold text-paper">
          {studentId ? "Edit student" : "New student"}
        </span>
        <span className="flex-1" />
      </div>

      <div className="flex-1 bg-paper rounded-t-[32px] px-[18px] md:px-7 pt-[18px] pb-14">
      <div className="max-w-[640px] mx-auto flex flex-col gap-4">

      <form
        onSubmit={submit}
        className="bg-white border-2 border-line rounded-[24px] shadow-[0_5px_0_#F3E6D8] p-5 flex flex-col gap-4"
      >
        <Field label="Name" required>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Full name"
            className="rc-input"
            required
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="Parent">
            <input
              value={form.parent}
              onChange={(e) => set("parent", e.target.value)}
              placeholder="Parent or guardian"
              className="rc-input"
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="07700 900000"
              className="rc-input"
            />
          </Field>
        </div>

        <div className="max-w-[200px]">
          <Field label="Age">
            <input
              type="number"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              placeholder="—"
              className="rc-input"
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2.5 bg-purple-soft border-2 border-purple-light2 rounded-[18px] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-base font-semibold text-purple-dark">
              Weekly classes
            </span>
            <span className="text-xs text-muted">Repeats every week</span>
          </div>

          {form.schedules.map((sched, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_48px] gap-2 items-center">
              <select
                value={sched.day}
                onChange={(e) => setSchedule(i, { day: e.target.value as ScheduleInput["day"] })}
                className="rc-input-alt"
              >
                <option value="">Day —</option>
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={sched.time}
                onChange={(e) => setSchedule(i, { time: e.target.value })}
                className="rc-input-alt"
              />
              <button
                type="button"
                onClick={() => removeScheduleRow(i)}
                className="w-12 h-12 rounded-2xl border-2 border-purple-light2 bg-white text-faint text-base cursor-pointer hover:border-red-border hover:text-red hover:bg-red-light"
                aria-label="Remove this class"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addScheduleRow}
            className="self-start bg-purple-light2 border-none text-purple-dark rounded-full min-h-[40px] px-4 font-body text-sm font-bold cursor-pointer hover:bg-purple-border"
          >
            + Add another class
          </button>
        </div>

        <Field label="Level">
          <LevelPicker
            levels={levelOptions}
            selectedId={form.level_id ? Number(form.level_id) : null}
            onSelect={(id) => set("level_id", id != null ? String(id) : "")}
            onLevelCreated={(l) => {
              setLevelOptions((ls) => [...ls, l]);
              set("level_id", String(l.id));
            }}
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Anything worth remembering between sessions…"
            className="rc-input"
          />
        </Field>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-light border-2 border-red-border rounded-2xl px-3.5 py-3">
            <span className="w-[22px] h-[22px] rounded-full bg-red text-white text-[13px] font-bold flex items-center justify-center flex-none">
              !
            </span>
            <span className="text-sm font-semibold text-red-text">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="min-h-[54px] border-none rounded-2xl bg-purple text-white font-body text-[17px] font-bold cursor-pointer shadow-[0_5px_0_#4A32C4] transition-transform active:translate-y-1 active:shadow-[0_1px_0_#4A32C4] disabled:opacity-65"
        >
          {isPending ? "Saving…" : studentId ? "Save changes" : "Add student"}
        </button>
      </form>

      </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-bold text-muted2 tracking-wide">
        {label} {required && <span className="text-pink">*</span>}
      </span>
      {children}
    </label>
  );
}
