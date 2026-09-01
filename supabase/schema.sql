-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- No auth, no RLS: this whole database belongs to one person, gated only by
-- the app's passcode screen.

create table if not exists levels (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

insert into levels (name, sort_order) values
  ('Pre-schooling', 1),
  ('Beginner', 2),
  ('Grade 1', 3),
  ('Grade 2', 4),
  ('Grade 3', 5),
  ('Grade 4', 6),
  ('Grade 5', 7),
  ('Grade 6', 8),
  ('Grade 7', 9),
  ('Grade 8', 10),
  ('Ear training', 11)
on conflict (name) do nothing;

create table if not exists students (
  id          bigint generated always as identity primary key,
  name        text not null,
  parent      text,
  phone       text,
  age         integer,
  level_id    bigint references levels(id) on delete set null,
  notes       text,
  archived    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- A student can have several fixed weekly classes (e.g. Wednesday AND
-- Thursday), but only one on any given day.
create table if not exists student_schedules (
  id          bigint generated always as identity primary key,
  student_id  bigint not null references students(id) on delete cascade,
  day         text not null check (day in ('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  time        time not null,
  unique (student_id, day)
);

create table if not exists sessions (
  id          bigint generated always as identity primary key,
  date        date not null unique,
  label       text,
  created_at  timestamptz not null default now()
);

create table if not exists attendance (
  id           bigint generated always as identity primary key,
  student_id   bigint not null references students(id) on delete cascade,
  session_id   bigint not null references sessions(id) on delete cascade,
  status       text not null default 'present' check (status in ('present','absent','late')),
  confirmed    boolean not null default false,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (student_id, session_id)
);

create index if not exists idx_schedules_day on student_schedules(day);
create index if not exists idx_schedules_student on student_schedules(student_id);
create index if not exists idx_attendance_student on attendance(student_id);
create index if not exists idx_attendance_session on attendance(session_id);
