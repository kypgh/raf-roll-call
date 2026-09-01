-- Generated from Timetable_Kyriakides_2026-2027 - Sheet1.csv
-- Run this in the Supabase SQL editor AFTER migration_001_multi_schedule.sql

do $$
declare
  new_student_id bigint;
begin

  -- Alexandra
  insert into students (name, parent, phone, age, level_id)
  values ('Alexandra', 'Tasos', '35799544483', null, (select id from levels where name = 'Pre-schooling'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Monday', '15:30');

  -- Natali
  insert into students (name, parent, phone, age, level_id)
  values ('Natali', 'Alina', '35797865182', null, (select id from levels where name = 'Pre-schooling'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Monday', '16:00');

  -- Sofia
  insert into students (name, parent, phone, age, level_id)
  values ('Sofia', 'Gemma', '35797431800', null, (select id from levels where name = 'Pre-schooling'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Monday', '16:30');

  -- Daria
  insert into students (name, parent, phone, age, level_id)
  values ('Daria', null, '35799263627', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Monday', '17:00');

  -- Dominik
  insert into students (name, parent, phone, age, level_id)
  values ('Dominik', 'Natalia', '35795607211', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Monday', '18:00');

  -- Markos
  insert into students (name, parent, phone, age, level_id)
  values ('Markos', 'Christina', '35799388607', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Wednesday', '14:15');

  -- Yiannis
  insert into students (name, parent, phone, age, level_id)
  values ('Yiannis', 'Vera', '35796676167', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Wednesday', '15:00');

  -- Mary
  insert into students (name, parent, phone, age, level_id)
  values ('Mary', 'Vera', '35796676167', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Wednesday', '15:45');

  -- Sasha
  insert into students (name, parent, phone, age, level_id)
  values ('Sasha', 'Peter', '35797523645', null, (select id from levels where name = 'Ear training'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Wednesday', '16:30');

  -- Emily
  insert into students (name, parent, phone, age, level_id)
  values ('Emily', 'Maarja', '35797781110', 3, (select id from levels where name = 'Pre-schooling'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Wednesday', '17:15');

  -- Dimitriana
  insert into students (name, parent, phone, age, level_id)
  values ('Dimitriana', 'Filippos Yiapanis', '35799035309', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Wednesday', '17:45');

  -- Emilia
  insert into students (name, parent, phone, age, level_id)
  values ('Emilia', 'Andrey + Marina', '35796525144,35796526315', null, (select id from levels where name = 'Grade 1'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Wednesday', '18:30');
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Thursday', '18:45');

  -- Ivan
  insert into students (name, parent, phone, age, level_id)
  values ('Ivan', 'Anna', '35796603933', 11, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Thursday', '14:15');

  -- Athinodoros
  insert into students (name, parent, phone, age, level_id)
  values ('Athinodoros', 'Liza', '35799818444', null, (select id from levels where name = 'Grade 4'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Thursday', '14:45');

  -- Ella
  insert into students (name, parent, phone, age, level_id)
  values ('Ella', 'Elina', '37128266944', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Thursday', '15:30');

  -- Γιώργος
  insert into students (name, parent, phone, age, level_id)
  values ('Γιώργος', 'Constantina', '35794067968', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Thursday', '16:30');

  -- Daniel
  insert into students (name, parent, phone, age, level_id)
  values ('Daniel', 'Alysa', '35796322422', null, (select id from levels where name = 'Grade 1'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Thursday', '17:15');

  -- Maria
  insert into students (name, parent, phone, age, level_id)
  values ('Maria', 'Konstantin', '35799902351', null, (select id from levels where name = 'Grade 1'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Thursday', '18:00');

  -- Nafsika
  insert into students (name, parent, phone, age, level_id)
  values ('Nafsika', 'Despoina', '35799608832', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Friday', '14:15');

  -- Ela
  insert into students (name, parent, phone, age, level_id)
  values ('Ela', 'Arzu', '491788847799', null, (select id from levels where name = 'Beginner'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Friday', '15:00');

  -- Sofia
  insert into students (name, parent, phone, age, level_id)
  values ('Sofia', 'Varvara', '35796854898', null, (select id from levels where name = 'Pre-schooling'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Friday', '16:00');

  -- Valeria
  insert into students (name, parent, phone, age, level_id)
  values ('Valeria', 'Maria', '79817586064', null, null)
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Friday', '16:30');

  -- Christos Matsis
  insert into students (name, parent, phone, age, level_id)
  values ('Christos Matsis', 'Christina Tsoulou', '35799143520', 3, (select id from levels where name = 'Pre-schooling'))
  returning id into new_student_id;
  insert into student_schedules (student_id, day, time) values (new_student_id, 'Friday', '17:15');

end $$;