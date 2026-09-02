# Boo Boo — attendance tracker

A tiny personal tool: manage your student team, take attendance session by
session, and keep notes and history per student. No accounts, just a single
passcode gate.

## 1. Set up Supabase (free)

1. Go to https://supabase.com, create a free account and a new project.
2. Once it's ready, open **SQL Editor → New query**, paste in the contents of
   `supabase/schema.sql`, and run it. This creates the `levels`, `students`,
   `sessions`, and `attendance` tables, and seeds the starting levels.
3. Go to **Project Settings → API**. You'll need two values from there:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (not the `anon` key) → `SUPABASE_SERVICE_ROLE_KEY`

   The service role key is powerful (it bypasses all restrictions), which is
   why this app only ever uses it on the server, never in the browser. Don't
   share this key or commit it to a public repo.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...       # from step 1
SUPABASE_SERVICE_ROLE_KEY=...      # from step 1
ACCESS_CODE=pick-anything          # what you'll type to unlock the app
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it'll redirect you to the passcode screen.

## 4. Deploy to Vercel (free)

1. Push this project to a GitHub repo (keep it **private**, since the code
   itself doesn't hide your data — the passcode does).
2. Go to https://vercel.com, "Add New Project", import the repo.
3. In the project's **Environment Variables** settings, add the same four
   variables from your `.env.local`.
4. Deploy. You'll get a URL like `your-app.vercel.app` — open it on your
   phone, tablet, and laptop, log in with your passcode, and you're set. Same
   database everywhere, so everything stays in sync.

## 5. Already have this running? Apply the schedule migration

If you set this up before, your database still has a single `day`/`time`
column on `students`. Run `supabase/migration_001_multi_schedule.sql` in the
SQL editor to move to the new `student_schedules` table, which lets a
student have more than one weekly class.

## 6. Importing an existing student list

If you have a team list in a spreadsheet, `scripts/generate_import.py` shows
the pattern used to turn a CSV into a safe SQL import: normalize phone
numbers, map old level names onto your Levels table, merge duplicate rows
that are really the same student with two weekly classes, and skip blank
rows. Adjust the column names and mapping rules at the top of the script for
your own file, run it (`python3 scripts/generate_import.py`, needs
`pandas`), then run the generated `.sql` file it writes out in the Supabase
SQL editor.


- **Week** — shows the next 7 days, built live from each student's fixed
  weekly `day`/`time`. Nothing is pre-created; tap a day to open it.
- **Session (a day)** — opening a date creates that day's session and one
  attendance row per scheduled student, the first time you visit it (past or
  future — visiting a missed day works exactly the same way). Mark
  Present/Absent/Late and jot a note; the row is flagged as "reviewed" the
  moment you touch it, so at a glance you can see who you haven't actually
  looked at yet, even though everyone defaults to Present.
- **Students** — add/edit/archive students. Archiving hides them from Week
  and the team without deleting their history.
- **Levels** — a plain, editable table, not hardcoded — add new ones any
  time from the Levels page.
- **History** — each student's profile lists every past session, status, and
  note, most recent first.

## Notes

- There's no real user authentication — the passcode is a light deterrent
  ("if someone finds the URL"), not real security. Don't put anything
  sensitive you wouldn't want exposed if the code leaked.
- If you ever want a second, fully separate instance (e.g. for a friend to
  track their own students), just create a second Supabase project and a
  second Vercel deployment from the same repo with different env vars —
  no code changes needed.
