"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "./supabase";
import { weekdayOf } from "./dates";
import { AttendanceStatus, Weekday } from "./types";

// This is a tiny single-user app -- there's no meaningful cost to
// over-invalidating, but under-invalidating means some page quietly shows
// old data until the next full reload. So every mutation below just clears
// the whole app's cache rather than hand-listing which pages happen to
// display the thing that changed (that list grows every time a new page
// reads the same data, and it's easy to forget one).
function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------- Levels ----------

export async function addLevel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name can't be empty." };

  const supabase = supabaseServer();
  const { data: max } = await supabase
    .from("levels")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (max?.sort_order ?? 0) + 1;

  const { error } = await supabase
    .from("levels")
    .insert({ name: trimmed, sort_order: nextOrder });

  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteLevel(id: number) {
  const supabase = supabaseServer();
  const { error } = await supabase.from("levels").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ---------- Students ----------

export type ScheduleInput = {
  day: Weekday | "";
  time: string; // "HH:MM"
};

export type StudentInput = {
  name: string;
  parent: string;
  phone: string;
  age: string; // from a form input, parsed below
  level_id: string; // from a select, parsed below
  notes: string;
  schedules: ScheduleInput[];
};

function normalizeStudentInput(input: StudentInput) {
  return {
    name: input.name.trim(),
    parent: input.parent.trim() || null,
    phone: input.phone.trim() || null,
    age: input.age ? Number(input.age) : null,
    level_id: input.level_id ? Number(input.level_id) : null,
    notes: input.notes.trim() || null,
  };
}

function validSchedules(schedules: ScheduleInput[]) {
  return schedules.filter((s) => s.day && s.time);
}

export async function addStudent(input: StudentInput) {
  if (!input.name.trim()) return { ok: false, error: "Name is required." };

  const supabase = supabaseServer();
  const { data: student, error } = await supabase
    .from("students")
    .insert(normalizeStudentInput(input))
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  const schedules = validSchedules(input.schedules);
  if (schedules.length > 0) {
    const { error: schedErr } = await supabase.from("student_schedules").insert(
      schedules.map((s) => ({
        student_id: student.id,
        day: s.day,
        time: s.time,
      }))
    );
    if (schedErr) return { ok: false, error: schedErr.message };
  }

  revalidateAll();
  return { ok: true };
}

export async function updateStudent(id: number, input: StudentInput) {
  if (!input.name.trim()) return { ok: false, error: "Name is required." };

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("students")
    .update(normalizeStudentInput(input))
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  // Simplest correct approach: replace all schedule rows for this student
  // rather than trying to diff old vs new.
  const { error: deleteErr } = await supabase
    .from("student_schedules")
    .delete()
    .eq("student_id", id);
  if (deleteErr) return { ok: false, error: deleteErr.message };

  const schedules = validSchedules(input.schedules);
  if (schedules.length > 0) {
    const { error: schedErr } = await supabase.from("student_schedules").insert(
      schedules.map((s) => ({
        student_id: id,
        day: s.day,
        time: s.time,
      }))
    );
    if (schedErr) return { ok: false, error: schedErr.message };
  }

  revalidateAll();
  return { ok: true };
}

export async function archiveStudent(id: number) {
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("students")
    .update({ archived: true })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ---------- Sessions & attendance ----------

// Ensures a `sessions` row exists for this date, and that every non-archived
// student whose weekly `day` matches this date's weekday has an `attendance`
// row for it. Safe to call repeatedly -- only ever creates what's missing.
export async function getOrCreateSessionForDate(dateStr: string) {
  const supabase = supabaseServer();
  const weekday = weekdayOf(dateStr);

  let { data: session } = await supabase
    .from("sessions")
    .select("id, date, label")
    .eq("date", dateStr)
    .maybeSingle();

  if (!session) {
    const { data: created, error: createErr } = await supabase
      .from("sessions")
      .insert({ date: dateStr })
      .select("id, date, label")
      .single();

    if (createErr) {
      // Another concurrent request (e.g. a duplicate prefetch/render) may
      // have created this session between our select and our insert.
      // That's fine -- just fetch the row it created instead of failing.
      if (createErr.code === "23505") {
        const { data: existing, error: refetchErr } = await supabase
          .from("sessions")
          .select("id, date, label")
          .eq("date", dateStr)
          .single();
        if (refetchErr) throw new Error(refetchErr.message);
        session = existing;
      } else {
        throw new Error(createErr.message);
      }
    } else {
      session = created;
    }
  }

  const { data: matchingSchedules, error: studentsErr } = await supabase
    .from("student_schedules")
    .select("student_id, students!inner(id, archived)")
    .eq("day", weekday)
    .eq("students.archived", false);
  if (studentsErr) throw new Error(studentsErr.message);

  const matchingStudents = (matchingSchedules ?? []).map((r: any) => ({
    id: r.student_id,
  }));

  if (matchingStudents.length > 0) {
    // Upsert-with-ignoreDuplicates instead of check-then-insert: safe even
    // if another concurrent request for this same session is doing the
    // same thing (e.g. a duplicate prefetch/render).
    const { error: insertErr } = await supabase.from("attendance").upsert(
      matchingStudents.map((s) => ({
        student_id: s.id,
        session_id: session!.id,
        status: "present" as AttendanceStatus,
        confirmed: false,
      })),
      { onConflict: "student_id,session_id", ignoreDuplicates: true }
    );
    if (insertErr) throw new Error(insertErr.message);
  }

  return session;
}

export async function updateAttendance(
  attendanceId: number,
  changes: { status?: AttendanceStatus; note?: string; confirmed?: boolean }
) {
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("attendance")
    .update({
      ...changes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", attendanceId);

  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// Adds a student who isn't normally scheduled today (a makeup / drop-in) to
// today's session.
export async function addStudentToSession(
  sessionId: number,
  studentId: number
) {
  const supabase = supabaseServer();
  const { error } = await supabase.from("attendance").upsert(
    {
      session_id: sessionId,
      student_id: studentId,
      status: "present" as AttendanceStatus,
      confirmed: false,
    },
    { onConflict: "student_id,session_id", ignoreDuplicates: true }
  );
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// Removes a student from a session (for undoing an accidental drop-in add).
export async function removeAttendance(attendanceId: number) {
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("id", attendanceId);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}
