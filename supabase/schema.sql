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

-- status is NULL until the student is actually marked -- that single field
-- is the only source of truth for "has this student been answered". There
-- is no separate confirmed/reviewed flag to disagree with it.
create table if not exists attendance (
  id           bigint generated always as identity primary key,
  student_id   bigint not null references students(id) on delete cascade,
  session_id   bigint not null references sessions(id) on delete cascade,
  status       text check (status is null or status in ('present','absent','teacher_absent')),
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (student_id, session_id)
);

-- A `teacher_absent` attendance row means the student is owed a lesson back.
-- `resolved_at is null` = still owed. Kept in sync with `attendance.status`
-- purely by the trigger below -- application code never writes here except
-- to flip `resolved_at`.
create table if not exists makeups (
  id             bigint generated always as identity primary key,
  attendance_id  bigint not null unique references attendance(id) on delete cascade,
  resolved_at    timestamptz,
  resolved_note  text,
  created_at     timestamptz not null default now()
);

-- Optional link from a *different* attendance row (a future drop-in booked
-- as a makeup) to the open lesson it's paying back. Marking that row present
-- resolves the linked makeup, same as ticking it manually.
alter table attendance add column if not exists makeup_id bigint references makeups(id) on delete set null;

create or replace function sync_makeup_for_attendance() returns trigger as $$
begin
  if new.status = 'teacher_absent' then
    insert into makeups (attendance_id, resolved_at)
    values (new.id, null)
    on conflict (attendance_id) do nothing;
  else
    delete from makeups where attendance_id = new.id;
  end if;

  if new.status = 'present' and new.makeup_id is not null then
    update makeups set resolved_at = now() where id = new.makeup_id and resolved_at is null;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_makeup on attendance;
create trigger trg_sync_makeup
  after insert or update of status on attendance
  for each row
  execute function sync_makeup_for_attendance();

create index if not exists idx_schedules_day on student_schedules(day);
create index if not exists idx_schedules_student on student_schedules(student_id);
create index if not exists idx_attendance_student on attendance(student_id);
create index if not exists idx_attendance_session on attendance(session_id);
create index if not exists idx_makeups_open on makeups(resolved_at) where resolved_at is null;
