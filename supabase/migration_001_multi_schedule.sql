-- Run this in your Supabase SQL editor. Safe to run once, on top of the
-- original schema.sql you already ran.
--
-- What it does: moves the single day/time columns off `students` into a new
-- `student_schedules` table, so a student can have more than one weekly
-- class (e.g. Wednesday AND Thursday). If you'd already added a day/time to
-- any student, this carries that single slot over as their first schedule
-- row before dropping the old columns -- nothing is silently lost.

create table if not exists student_schedules (
  id          bigint generated always as identity primary key,
  student_id  bigint not null references students(id) on delete cascade,
  day         text not null check (day in ('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  time        time not null,
  unique (student_id, day)
);

create index if not exists idx_schedules_day on student_schedules(day);
create index if not exists idx_schedules_student on student_schedules(student_id);

-- Carry over any existing single day/time values before we drop them.
insert into student_schedules (student_id, day, time)
select id, day, time from students
where day is not null and time is not null
on conflict (student_id, day) do nothing;

alter table students drop column if exists day;
alter table students drop column if exists time;
