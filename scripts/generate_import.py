import pandas as pd
import re

df = pd.read_csv("/mnt/user-data/uploads/Timetable_Kyriakides_2026-2027_-_Sheet1.csv")
df = df[df["Student"].notna()].copy()  # drop blank separator rows

LEVEL_MAP = {
    "pre-schooling": "Pre-schooling",
    "beg": "Beginner",
    "1st grade": "Grade 1",
    "4th grade": "Grade 4",
    "ear-training": "Ear training",
}

# Manual override agreed with the user: corrected phone digit.
PHONE_OVERRIDES = {
    ("Alexandra", "Tasos"): "99544483",
}


def normalize_phone(raw: str) -> str | None:
    if not raw or not isinstance(raw, str):
        return None
    raw = raw.strip()
    if raw == "-" or raw == "":
        return None
    digits = re.sub(r"\s+", "", raw)
    if digits.startswith("00"):
        return digits[2:]  # already has a country code
    return "357" + digits  # assume local Cyprus number


def normalize_phone_field(raw: str, name: str, parent: str) -> str | None:
    if not isinstance(raw, str):
        return None
    override_key = (name, parent if isinstance(parent, str) else "")
    if override_key in PHONE_OVERRIDES:
        raw = PHONE_OVERRIDES[override_key]
    parts = [p.strip() for p in raw.split("+")]
    normalized = [normalize_phone(p) for p in parts]
    normalized = [n for n in normalized if n]
    return ",".join(normalized) if normalized else None


def normalize_parent(raw) -> str | None:
    if not isinstance(raw, str):
        return None
    raw = raw.strip()
    return None if raw in ("-", "") else raw


def normalize_age(raw) -> int | None:
    if pd.isna(raw):
        return None
    if isinstance(raw, str):
        raw = raw.replace(",", ".")
    try:
        return int(float(raw))
    except ValueError:
        return None


def normalize_level(raw) -> str | None:
    if not isinstance(raw, str) or not raw.strip():
        return None
    key = raw.strip().lower()
    return LEVEL_MAP.get(key)  # None if not matchable -> left blank


def parse_time_range(raw: str) -> str:
    start = raw.split("-")[0].strip()
    h, m = start.split(".")
    return f"{int(h):02d}:{int(m):02d}"


def sql_str(value) -> str:
    if value is None:
        return "null"
    return "'" + str(value).replace("'", "''") + "'"


# ---- Merge duplicate rows that are really the same student with two   ----
# ---- weekly classes (same name + same parent + same phone appearing   ----
# ---- more than once).                                                 ----
students = {}  # key -> dict with student fields + list of (day, time)
order = []

for _, row in df.iterrows():
    name = str(row["Student"]).strip()
    parent = normalize_parent(row["Parent"])
    phone = normalize_phone_field(row["Phone"], name, row["Parent"])
    key = (name, parent, phone)

    if key not in students:
        students[key] = {
            "name": name,
            "parent": parent,
            "phone": phone,
            "age": normalize_age(row["Age"]),
            "level": normalize_level(row["Level"]),
            "schedules": [],
        }
        order.append(key)

    students[key]["schedules"].append(
        (row["Day"].strip(), parse_time_range(row["Time"]))
    )

# ---- Emit SQL ----
lines = []
lines.append("-- Generated from Timetable_Kyriakides_2026-2027 - Sheet1.csv")
lines.append("-- Run this in the Supabase SQL editor AFTER migration_001_multi_schedule.sql")
lines.append("")
lines.append("do $$")
lines.append("declare")
lines.append("  new_student_id bigint;")
lines.append("begin")

for key in order:
    s = students[key]
    level_sql = (
        f"(select id from levels where name = {sql_str(s['level'])})"
        if s["level"]
        else "null"
    )
    lines.append("")
    lines.append(f"  -- {s['name']}")
    lines.append("  insert into students (name, parent, phone, age, level_id)")
    lines.append(
        f"  values ({sql_str(s['name'])}, {sql_str(s['parent'])}, "
        f"{sql_str(s['phone'])}, {s['age'] if s['age'] is not None else 'null'}, {level_sql})"
    )
    lines.append("  returning id into new_student_id;")
    for day, time in s["schedules"]:
        lines.append(
            f"  insert into student_schedules (student_id, day, time) "
            f"values (new_student_id, {sql_str(day)}, {sql_str(time)});"
        )

lines.append("")
lines.append("end $$;")

sql = "\n".join(lines)
with open("/home/claude/attendance-app/supabase/import_students.sql", "w") as f:
    f.write(sql)

print(f"{len(order)} unique students, {sum(len(s['schedules']) for s in students.values())} schedule rows")
for key in order:
    s = students[key]
    flag = " <-- MULTIPLE SESSIONS" if len(s["schedules"]) > 1 else ""
    flag2 = " <-- NO LEVEL MATCHED" if s["level"] is None else ""
    print(f"  {s['name']:20s} level={s['level'] or '-':14s} phone={s['phone']}{flag}{flag2}")
