-- Run this in your Supabase SQL editor, on top of schema.sql +
-- migration_001_multi_schedule.sql.
--
-- Two changes, one model:
--
-- 1. Retires 'late' in favour of 'teacher_absent'. 'late' described the
--    student and closed the lesson; 'teacher_absent' describes the lesson
--    and opens a debt -- the student is owed a lesson back until the
--    teacher marks it made up.
--
-- 2. Drops `confirmed`. There is now exactly one field that says whether a
--    student has been marked for a session: `status`. NULL means no answer
--    yet -- full stop. A row can exist with status = NULL (e.g. a drop-in
--    added to today's list before anyone decides what happened) without
--    that counting as "answered". This replaces a status+boolean pair that
--    could disagree with each other with one field that can't.

update attendance set status = 'present' where status = 'late';

alter table attendance drop constraint if exists attendance_status_check;
alter table attendance alter column status drop default;
alter table attendance alter column status drop not null;
alter table attendance add constraint attendance_status_check
  check (status is null or status in ('present', 'absent', 'teacher_absent'));

alter table attendance drop column if exists confirmed;

create table if not exists makeups (
  id             bigint generated always as identity primary key,
  attendance_id  bigint not null unique references attendance(id) on delete cascade,
  resolved_at    timestamptz,
  resolved_note  text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_makeups_open on makeups(resolved_at) where resolved_at is null;

-- Optional link from a *different* attendance row (a future drop-in booked
-- as a makeup) to the open lesson it's paying back. Marking that row present
-- resolves the linked makeup, same as ticking it manually.
alter table attendance add column if not exists makeup_id bigint references makeups(id) on delete set null;

-- Keeps `makeups` in sync with `attendance.status` for every write path
-- (deck, inline edit, bulk "I'm out today", drop-ins) so application code
-- never has to remember to do it itself: writing 'teacher_absent' opens a
-- makeup, changing away from it (including back to NULL) closes (deletes)
-- the makeup, and marking a linked drop-in 'present' resolves the makeup it
-- was booked against.
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
