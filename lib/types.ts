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

export type AttendanceStatus = "present" | "absent" | "late";

export type AttendanceRow = {
  id: number;
  student_id: number;
  session_id: number;
  status: AttendanceStatus;
  confirmed: boolean;
  note: string | null;
};

export type SessionRow = {
  id: number;
  date: string; // "YYYY-MM-DD"
  label: string | null;
};
