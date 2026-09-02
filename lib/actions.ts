"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "./supabase";
import { todayString, weekdayOf } from "./dates";
import { AttendanceStatus, Weekday, isAnswered } from "./types";

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

  const { data: created, error } = await supabase
    .from("levels")
    .insert({ name: trimmed, sort_order: nextOrder })
    .select("id, name")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id: created.id, name: created.name };
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

// Sets a student's level immediately (the profile page's live chip picker --
// no surrounding form, no save button).
export async function setStudentLevel(id: number, levelId: number | null) {
  const supabase = supabaseServer();
  const { error } = await supabase.from("students").update({ level_id: levelId }).eq("id", id);
  if (error) return { ok: false, error: error.message };
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

  // Archiving closes the book: any lesson this student is still owed is
  // resolved silently rather than sitting on the owed list forever for a
  // student who's no longer coming back.
  const { data: openMakeups } = await supabase
    .from("makeups")
    .select("id, attendance!inner(student_id)")
    .eq("attendance.student_id", id)
    .is("resolved_at", null);
  const openIds = (openMakeups ?? []).map((m: any) => m.id);
  if (openIds.length > 0) {
    await supabase
      .from("makeups")
      .update({ resolved_at: new Date().toISOString() })
      .in("id", openIds);
  }

  revalidateAll();
  return { ok: true };
}

// ---------- Sessions & attendance ----------

// A `sessions` row exists only where something has actually been written --
// a register taken, a status marked ahead of time. Viewing a day never
// creates one; only a mutation does, via this helper.
export async function ensureSessionForDate(dateStr: string) {
  const supabase = supabaseServer();

  let { data: session } = await supabase
    .from("sessions")
    .select("id, date, label")
    .eq("date", dateStr)
    .maybeSingle();

  if (session) return session;

  const { data: created, error: createErr } = await supabase
    .from("sessions")
    .insert({ date: dateStr })
    .select("id, date, label")
    .single();

  if (!createErr) return created;

  // Another concurrent request (e.g. a duplicate prefetch/render) may have
  // created this session between our select and our insert. That's fine --
  // just fetch the row it created instead of failing.
  if (createErr.code === "23505") {
    const { data: existing, error: refetchErr } = await supabase
      .from("sessions")
      .select("id, date, label")
      .eq("date", dateStr)
      .single();
    if (refetchErr) throw new Error(refetchErr.message);
    return existing;
  }

  throw new Error(createErr.message);
}

export async function updateAttendance(
  attendanceId: number,
  changes: { status?: AttendanceStatus | null; note?: string | null }
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

// Records an answer for one student on one day -- the deck's Present/Away/
// "I was out" buttons, and a future day's pre-marked absence. Creates the
// day's session row on first write. `makeupId` links this row (a drop-in) to
// an older open makeup it's paying back: marking it present will resolve
// that makeup via the DB trigger.
export async function answerAttendance(
  dateStr: string,
  studentId: number,
  status: AttendanceStatus,
  opts?: { note?: string; makeupId?: number }
) {
  const supabase = supabaseServer();
  const session = await ensureSessionForDate(dateStr);

  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      {
        student_id: studentId,
        session_id: session.id,
        status,
        note: opts?.note ?? null,
        makeup_id: opts?.makeupId ?? null,
      },
      { onConflict: "student_id,session_id" }
    )
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, attendanceId: data.id, sessionId: session.id };
}

// Sets a note without deciding a status -- e.g. jotting something down on a
// future lesson before it happens. Deliberately omits `status` from the
// upsert payload (rather than passing `status: null`) so an existing row's
// status is left untouched on conflict; only inserting a brand-new row gets
// the "no answer yet" default.
export async function setNoteForDay(dateStr: string, studentId: number, note: string) {
  const supabase = supabaseServer();
  const session = await ensureSessionForDate(dateStr);

  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      { student_id: studentId, session_id: session.id, note },
      { onConflict: "student_id,session_id" }
    )
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, attendanceId: data.id };
}

// Adds a student who isn't normally scheduled today (a drop-in / makeup) to
// a day's session, unmarked -- same "no answer yet" state as any scheduled
// student who hasn't been marked. `makeupId` links it to an open lesson
// it's paying back.
export async function addStudentToSession(
  dateStr: string,
  studentId: number,
  makeupId?: number
) {
  const supabase = supabaseServer();
  const session = await ensureSessionForDate(dateStr);
  const { error } = await supabase.from("attendance").upsert(
    {
      session_id: session.id,
      student_id: studentId,
      status: null,
      makeup_id: makeupId ?? null,
    },
    { onConflict: "student_id,session_id", ignoreDuplicates: true }
  );
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, sessionId: session.id };
}

// Removes a student from a session (undoing an accidental drop-in add, or a
// deck "Undo" putting an answered student back into the queue).
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

// "I'm out today" / "I'll be out this day" -- marks every scheduled student
// on this date teacher_absent in one action, opening a makeup for each.
export async function markTeacherAbsentForDay(dateStr: string) {
  const supabase = supabaseServer();
  const weekday = weekdayOf(dateStr);

  const { data: matchingSchedules, error: schedErr } = await supabase
    .from("student_schedules")
    .select("student_id, students!inner(id, archived)")
    .eq("day", weekday)
    .eq("students.archived", false);
  if (schedErr) return { ok: false, error: schedErr.message };

  const studentIds = (matchingSchedules ?? []).map((r: any) => r.student_id);
  if (studentIds.length === 0) return { ok: true };

  const session = await ensureSessionForDate(dateStr);
  const { error } = await supabase.from("attendance").upsert(
    studentIds.map((id: number) => ({
      student_id: id,
      session_id: session.id,
      status: "teacher_absent" as AttendanceStatus,
    })),
    { onConflict: "student_id,session_id" }
  );
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// "I wasn't out after all" -- reverts every teacher_absent row this bulk
// action wrote on this date. Deleting (rather than resetting to present)
// puts the day back exactly where it was: nothing written yet.
export async function revertTeacherAbsentForDay(dateStr: string) {
  const supabase = supabaseServer();
  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("date", dateStr)
    .maybeSingle();
  if (!session) return { ok: true };

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("session_id", session.id)
    .eq("status", "teacher_absent");
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ---------- Makeups (owed lessons) ----------

export async function resolveMakeup(id: number) {
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("makeups")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function unresolveMakeup(id: number) {
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("makeups")
    .update({ resolved_at: null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function getOpenMakeupsCount(): Promise<number> {
  const supabase = supabaseServer();
  const { count } = await supabase
    .from("makeups")
    .select("id", { count: "exact", head: true })
    .is("resolved_at", null);
  return count ?? 0;
}

export type OwedLessonRow = {
  makeupId: number;
  studentId: number;
  studentName: string;
  missedDate: string;
  resolvedAt: string | null;
};

export async function getOwedLessons(): Promise<{
  open: OwedLessonRow[];
  resolved: OwedLessonRow[];
}> {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("makeups")
    .select(
      "id, resolved_at, attendance!inner(student_id, students(id, name), sessions(date))"
    )
    .order("id", { ascending: true });

  const rows: OwedLessonRow[] = (data ?? []).map((m: any) => ({
    makeupId: m.id,
    studentId: m.attendance?.students?.id ?? m.attendance?.student_id,
    studentName: m.attendance?.students?.name ?? "Unknown",
    missedDate: m.attendance?.sessions?.date ?? "",
    resolvedAt: m.resolved_at,
  }));

  const open = rows
    .filter((r) => !r.resolvedAt)
    .sort((a, b) => a.missedDate.localeCompare(b.missedDate));
  const resolved = rows
    .filter((r) => r.resolvedAt)
    .sort((a, b) => (b.resolvedAt ?? "").localeCompare(a.resolvedAt ?? ""));

  return { open, resolved };
}

// One open makeup per student -- the oldest one, since that's the one a new
// drop-in should offer to pay back.
export async function getOpenMakeupsByStudent(
  studentIds: number[]
): Promise<Map<number, { makeupId: number; missedDate: string }>> {
  const result = new Map<number, { makeupId: number; missedDate: string }>();
  if (studentIds.length === 0) return result;

  const supabase = supabaseServer();
  const { data } = await supabase
    .from("makeups")
    .select("id, attendance!inner(student_id, sessions(date))")
    .is("resolved_at", null)
    .in("attendance.student_id", studentIds);

  for (const m of (data ?? []) as any[]) {
    const sid = m.attendance?.student_id;
    const missedDate = m.attendance?.sessions?.date;
    if (sid == null || !missedDate) continue;
    const existing = result.get(sid);
    if (!existing || missedDate < existing.missedDate) {
      result.set(sid, { makeupId: m.id, missedDate });
    }
  }
  return result;
}

// ---------- Day Sheet ----------

export type DayMode = "today" | "past" | "partial" | "teacherout" | "future" | "empty";

export type DayStudentRow = {
  attendanceId: number | null;
  studentId: number;
  studentName: string;
  time: string | null;
  // NULL = not marked yet -- see isAnswered(). The only "is this student
  // done" check anywhere is `isAnswered(row.status)`.
  status: AttendanceStatus | null;
  note: string | null;
  isDropIn: boolean;
  openMakeup: { makeupId: number; missedDate: string } | null;
};

export type DaySheetData = {
  date: string;
  sessionId: number | null;
  mode: DayMode;
  rows: DayStudentRow[];
  present: number;
  away: number;
  out: number;
  answeredCount: number;
  total: number;
};

export async function loadDaySheet(dateStr: string): Promise<DaySheetData> {
  const supabase = supabaseServer();
  const today = todayString();
  const isFuture = dateStr > today;
  const weekday = weekdayOf(dateStr);

  const [{ data: session }, { data: schedules }] = await Promise.all([
    supabase.from("sessions").select("id").eq("date", dateStr).maybeSingle(),
    supabase
      .from("student_schedules")
      .select("student_id, time, students!inner(id, name, archived)")
      .eq("day", weekday)
      .eq("students.archived", false),
  ]);

  const { data: attendanceRows } = session
    ? await supabase
        .from("attendance")
        .select("id, status, note, students(id, name)")
        .eq("session_id", session.id)
    : { data: [] as any[] };

  const nameById = new Map<number, string>();
  const timeByStudent = new Map<number, string>();
  for (const s of (schedules ?? []) as any[]) {
    nameById.set(s.students.id, s.students.name);
    timeByStudent.set(s.students.id, s.time);
  }

  const attendanceByStudent = new Map<number, any>();
  for (const r of (attendanceRows ?? []) as any[]) {
    const sid = r.students?.id;
    if (sid == null) continue;
    attendanceByStudent.set(sid, r);
    if (!nameById.has(sid)) nameById.set(sid, r.students?.name ?? "Unknown");
  }

  const studentIds = Array.from(
    new Set<number>([...timeByStudent.keys(), ...attendanceByStudent.keys()])
  );

  const openMakeupsByStudent = isFuture
    ? await getOpenMakeupsByStudent(studentIds)
    : new Map<number, { makeupId: number; missedDate: string }>();

  const rows: DayStudentRow[] = studentIds
    .map((sid) => {
      const att = attendanceByStudent.get(sid);
      const time = timeByStudent.get(sid) ?? null;
      return {
        attendanceId: att?.id ?? null,
        studentId: sid,
        studentName: nameById.get(sid) ?? "Unknown",
        time,
        status: att?.status ?? null,
        note: att?.note ?? null,
        isDropIn: time == null,
        openMakeup: openMakeupsByStudent.get(sid) ?? null,
      };
    })
    .sort((a, b) => (a.time ?? "zzz").localeCompare(b.time ?? "zzz"));

  let present = 0;
  let away = 0;
  let out = 0;
  let answeredCount = 0;
  for (const r of rows) {
    if (isAnswered(r.status)) answeredCount++;
    if (r.status === "present") present++;
    else if (r.status === "absent") away++;
    else if (r.status === "teacher_absent") out++;
  }
  const total = rows.length;

  let mode: DayMode;
  if (total === 0) {
    mode = isFuture ? "future" : "empty";
  } else if (isFuture) {
    mode = "future";
  } else if (out === total) {
    mode = "teacherout";
  } else if (answeredCount === 0) {
    mode = "today";
  } else if (answeredCount === total) {
    mode = "past";
  } else {
    mode = "partial";
  }

  return {
    date: dateStr,
    sessionId: session?.id ?? null,
    mode,
    rows,
    present,
    away,
    out,
    answeredCount,
    total,
  };
}

// ---------- Register deck ----------

export type DeckMember = {
  studentId: number;
  studentName: string;
  time: string;
  answered: { attendanceId: number; status: AttendanceStatus } | null;
};

export async function getDeckQueue(dateStr: string): Promise<DeckMember[]> {
  const supabase = supabaseServer();
  const weekday = weekdayOf(dateStr);

  const { data: schedules } = await supabase
    .from("student_schedules")
    .select("student_id, time, students!inner(id, name, archived)")
    .eq("day", weekday)
    .eq("students.archived", false)
    .order("time", { ascending: true });

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("date", dateStr)
    .maybeSingle();

  const { data: attendance } = session
    ? await supabase
        .from("attendance")
        .select("id, student_id, status")
        .eq("session_id", session.id)
    : { data: [] as any[] };

  const attendanceByStudent = new Map(
    (attendance ?? []).map((a: any) => [a.student_id, a])
  );

  return ((schedules ?? []) as any[]).map((s) => {
    const a = attendanceByStudent.get(s.students.id);
    return {
      studentId: s.students.id,
      studentName: s.students.name,
      time: s.time,
      answered: a && isAnswered(a.status) ? { attendanceId: a.id, status: a.status } : null,
    };
  });
}

// ---------- Rail ----------

export type RailDay = { date: string; present: number; away: number; out: number };

// Sessions descending, for the date rail's infinite-backwards paging. Only
// dates where something was actually written have a row -- two years of
// teaching is a couple hundred rows, not 730, so this pages cheaply.
export async function getRecentSessionDays(
  beforeDate: string,
  limit: number
): Promise<RailDay[]> {
  const supabase = supabaseServer();
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, date")
    .lt("date", beforeDate)
    .order("date", { ascending: false })
    .limit(limit);

  const ids = (sessions ?? []).map((s: any) => s.id);
  const { data: attendance } =
    ids.length > 0
      ? await supabase.from("attendance").select("session_id, status").in("session_id", ids)
      : { data: [] as any[] };

  const countsBySession = new Map<number, { present: number; away: number; out: number }>();
  for (const a of (attendance ?? []) as any[]) {
    const c = countsBySession.get(a.session_id) ?? { present: 0, away: 0, out: 0 };
    if (a.status === "present") c.present++;
    else if (a.status === "absent") c.away++;
    else if (a.status === "teacher_absent") c.out++;
    countsBySession.set(a.session_id, c);
  }

  return ((sessions ?? []) as any[]).map((s) => ({
    date: s.date,
    ...(countsBySession.get(s.id) ?? { present: 0, away: 0, out: 0 }),
  }));
}
