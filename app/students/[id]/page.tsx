import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { getOpenMakeupsByStudent } from "@/lib/actions";
import { friendlyDate, friendlyTime } from "@/lib/dates";
import { avatarColor, initials, STATUS_STYLE } from "@/lib/colors";
import { safeInternalPath } from "@/lib/nav";
import { whatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import ArchiveButton from "@/components/ArchiveButton";
import OwedProfilePill from "@/components/OwedProfilePill";
import StudentLevelSection from "@/components/StudentLevelSection";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  const id = Number(params.id);
  const backHref = safeInternalPath(searchParams.from, "/team");
  const supabase = supabaseServer();

  // Only answered sessions count as history -- a drop-in added but never
  // marked isn't an outcome worth showing.
  const [{ data: student }, { data: levels }, { data: history }, openMakeupsByStudent] =
    await Promise.all([
      supabase
        .from("students")
        .select("*, student_schedules(day, time)")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("levels").select("id, name").order("sort_order", { ascending: true }),
      supabase
        .from("attendance")
        .select("id, status, note, sessions(date)")
        .eq("student_id", id)
        .not("status", "is", null)
        .order("id", { ascending: false }),
      getOpenMakeupsByStudent([id]),
    ]);

  if (!student) notFound();

  const sorted = (history ?? []).slice().sort((a: any, b: any) =>
    (b.sessions?.date ?? "").localeCompare(a.sessions?.date ?? "")
  );

  const av = avatarColor(student.id);
  const openMakeup = openMakeupsByStudent.get(id) ?? null;

  const totalSessions = sorted.length;
  const presentCount = sorted.filter((h: any) => h.status === "present").length;
  const presentRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : null;
  const recentBars = sorted.slice(0, 14).slice().reverse();

  const schedules = student.student_schedules ?? [];

  return (
    <div className="bg-ink min-h-screen flex flex-col">
      <div className="flex items-center gap-2.5 px-[18px] md:px-7 pt-[18px] pb-3.5 flex-none">
        <Link
          href={backHref}
          aria-label="Back"
          className="no-underline w-10 h-10 rounded-full bg-[rgba(107,78,255,.16)] hover:bg-[rgba(107,78,255,.26)] border-2 border-[rgba(107,78,255,.4)] flex items-center justify-center text-lg text-[#C9BBFF] flex-none transition-colors"
        >
          ‹
        </Link>
        <span className="flex-1" />
        <Link
          href={`/students/${id}/edit`}
          className="no-underline text-[13px] font-bold text-[#E4DDEC] bg-[rgba(255,246,236,.08)] border-2 border-[rgba(255,246,236,.4)] hover:bg-[rgba(255,246,236,.16)] rounded-full px-[15px] py-2.5 transition-colors flex-none"
        >
          Edit details
        </Link>
      </div>

      <div className="flex-1 bg-paper rounded-t-[32px] px-[18px] md:px-7 pt-[18px] pb-14">
        <div className="max-w-[640px] mx-auto flex flex-col gap-3.5">
          <div className="flex items-start gap-3.5 flex-wrap">
            <span
              className="w-[60px] h-[60px] rounded-full font-display text-xl font-semibold flex items-center justify-center flex-none"
              style={{ background: av.bg, color: av.fg, boxShadow: `0 4px 0 ${av.shadow}` }}
            >
              {initials(student.name)}
            </span>
            <div className="flex-1 min-w-[160px] flex flex-col gap-1.5">
              <h1 className="font-display font-semibold text-[27px] leading-[1.05] tracking-tight m-0">
                {student.name}
              </h1>
              <div className="flex items-center gap-1.5 flex-wrap">
                {schedules.map((sc: any, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-semibold text-muted2 bg-white border-2 border-line rounded-full px-2.5 py-0.5"
                  >
                    {sc.day} {friendlyTime(sc.time)}
                  </span>
                ))}
                {student.age != null && (
                  <span className="text-xs font-semibold text-muted px-0.5">age {student.age}</span>
                )}
              </div>
            </div>
          </div>

          <StudentLevelSection studentId={id} levels={levels ?? []} initialLevelId={student.level_id} />

          {(student.parent || student.phone || student.notes) && (
            <div className="bg-white border-2 border-line rounded-[20px] p-3.5 flex flex-col gap-3">
              {student.parent && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-[.06em] text-faint2">Parent</span>
                  <span className="text-[13px] font-bold text-muted2">{student.parent}</span>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-[.06em] text-faint2">Phone</span>
                    <span className="text-sm font-semibold truncate">{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <a
                      href={`tel:${student.phone}`}
                      aria-label={`Call ${student.parent || student.name}`}
                      className="w-9 h-9 rounded-full bg-purple-light2 text-purple-dark flex items-center justify-center flex-none transition-colors hover:bg-purple-border"
                    >
                      <PhoneIcon />
                    </a>
                    <a
                      href={whatsAppLink(student.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Message ${student.parent || student.name} on WhatsApp`}
                      className="w-9 h-9 rounded-full bg-green-light text-green-darker flex items-center justify-center flex-none transition-colors hover:bg-green-border"
                    >
                      <WhatsAppIcon />
                    </a>
                  </div>
                </div>
              )}
              {student.notes && (
                <p
                  className={`m-0 text-sm text-muted2 ${
                    student.parent || student.phone ? "border-t-2 border-dashed border-line pt-2" : ""
                  }`}
                >
                  {student.notes}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2.5 mt-1">
            <h2 className="font-display font-semibold text-[19px] m-0">History</h2>
            <span className="h-0.5 flex-1 bg-line" />
            {totalSessions > 0 && (
              <span className="text-[12px] font-bold text-muted">
                {totalSessions} {totalSessions === 1 ? "session" : "sessions"}
                {presentRate != null ? ` · ${presentRate}% present` : ""}
              </span>
            )}
          </div>

          {openMakeup && (
            <OwedProfilePill studentId={id} makeupId={openMakeup.makeupId} missedDate={openMakeup.missedDate} />
          )}

          {recentBars.length > 0 && (
            <div className="flex gap-1 items-end bg-white border-2 border-line rounded-[18px] p-3">
              {recentBars.map((h: any) => (
                <span
                  key={h.id}
                  className="flex-1 h-[34px] rounded-[6px]"
                  style={{ background: STATUS_STYLE[h.status as keyof typeof STATUS_STYLE]?.dot }}
                />
              ))}
            </div>
          )}

          {sorted.length === 0 ? (
            <p className="text-sm text-muted">No sessions recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-0.5">
              {sorted.map((h: any) => {
                const style = STATUS_STYLE[h.status as keyof typeof STATUS_STYLE];
                const isOwed = h.status === "teacher_absent";
                return (
                  <div
                    key={h.id}
                    className="flex items-start gap-2.5 bg-white border-2 border-line rounded-[18px] px-3.5 py-3"
                  >
                    <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-none" style={{ background: style.dot }} />
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-bold">{friendlyDate(h.sessions?.date ?? "")}</span>
                      {isOwed ? (
                        <span className="text-xs font-bold text-gold-text2 bg-gold-light rounded-full px-2.5 py-0.5 self-start">
                          I was out · owed
                        </span>
                      ) : h.note ? (
                        <span className="text-[13px] text-muted2">{h.note}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-2 border-t-2 border-dashed border-line pt-4">
            <ArchiveButton studentId={id} studentName={student.name} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
