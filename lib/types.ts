export type Weekday =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export const WEEKDAYS: Weekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export type Level = {
  id: number;
  name: string;
  sort_order: number;
};

export type StudentSchedule = {
  id: number;
  student_id: number;
  day: Weekday;
  time: string; // "HH:MM:SS"
};

export type Student = {
  id: number;
  name: string;
  parent: string | null;
  phone: string | null;
  age: number | null;
  level_id: number | null;
  notes: string | null;
  archived: boolean;
};

export type StudentWithLevel = Student & {
  levels: { name: string } | null;
};

export type AttendanceStatus = "present" | "absent" | "teacher_absent";

export type AttendanceRow = {
  id: number;
  student_id: number;
  session_id: number;
  // NULL = not marked yet. This is the only thing that means "unanswered"
  // anywhere in the app -- there is no separate confirmed/reviewed flag.
  status: AttendanceStatus | null;
  note: string | null;
};

// The one place "has this student been answered?" is defined. Every screen
// (Day Sheet, Deck, history, rail) calls this instead of re-deriving it.
export function isAnswered(
  status: AttendanceStatus | null | undefined
): status is AttendanceStatus {
  return status != null;
}

export type SessionRow = {
  id: number;
  date: string; // "YYYY-MM-DD"
  label: string | null;
};

export type Makeup = {
  id: number;
  attendance_id: number;
  resolved_at: string | null;
  resolved_note: string | null;
};

export type MessageRecipient = {
  studentId: number;
  name: string;
  parent: string | null;
  phone: string | null;
  message: string;
  sent: boolean;
  sentAt: string | null;
};

export type MessageBatch = {
  createdAt: string;
  template: string;
  source: string | null;
  recipients: MessageRecipient[];
};
