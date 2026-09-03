import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { loadDaySheet } from "@/lib/actions";
import { friendlyDate, friendlyTime } from "@/lib/dates";
import MessageComposer, { ComposerCandidate } from "@/components/messages/MessageComposer";

export const dynamic = "force-dynamic";

export default async function NewMessagePage({
  searchParams,
}: {
  searchParams: { date?: string; ids?: string };
}) {
  const supabase = supabaseServer();

  let candidates: ComposerCandidate[] = [];
  let source: string;
  let heading: string;
  let backHref: string;

  if (searchParams.date) {
    const dateStr = searchParams.date;
    const day = await loadDaySheet(dateStr);
    const studentIds = day.rows.map((r) => r.studentId);
    const timeById = new Map(day.rows.map((r) => [r.studentId, r.time]));

    const { data: students } = studentIds.length
      ? await supabase
          .from("students")
          .select("id, name, parent, phone, age, levels(name)")
          .in("id", studentIds)
      : { data: [] as any[] };

    candidates = (students ?? []).map((s: any) => ({
      studentId: s.id,
      name: s.name,
      parent: s.parent ?? "",
      phone: s.phone ?? null,
      age: s.age != null ? String(s.age) : "",
      level: s.levels?.name ?? "",
      time: friendlyTime(timeById.get(s.id) ?? null),
    }));
    source = `day:${dateStr}`;
    heading = friendlyDate(dateStr);
    backHref = `/day/${dateStr}`;
  } else if (searchParams.ids) {
    const ids = searchParams.ids
      .split(",")
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));

    const { data: students } = ids.length
      ? await supabase
          .from("students")
          .select("id, name, parent, phone, age, levels(name)")
          .in("id", ids)
      : { data: [] as any[] };

    candidates = (students ?? []).map((s: any) => ({
      studentId: s.id,
      name: s.name,
      parent: s.parent ?? "",
      phone: s.phone ?? null,
      age: s.age != null ? String(s.age) : "",
      level: s.levels?.name ?? "",
      time: "",
    }));
    source = "team";
    heading = "Selected students";
    backHref = "/team";
  } else {
    redirect("/messages/last");
  }

  return (
    <div className="bg-ink min-h-screen flex flex-col">
      <div className="flex items-center gap-2.5 px-[18px] md:px-7 pt-[18px] pb-3.5 flex-none">
        <span className="select-none font-display font-semibold text-xl text-paper flex-1">
          New message
        </span>
        <Link
          href={backHref}
          className="no-underline w-10 h-10 rounded-full bg-[rgba(255,246,236,.08)] hover:bg-[rgba(255,246,236,.16)] border-2 border-[rgba(255,246,236,.4)] flex items-center justify-center text-[15px] text-[#BBB0C6] flex-none transition-colors"
        >
          ✕
        </Link>
      </div>

      <div className="flex-1 bg-paper rounded-t-[32px] px-[18px] md:px-7 pt-[18px] pb-28">
        <div className="max-w-[640px] mx-auto">
          <MessageComposer candidates={candidates} source={source} heading={heading} />
        </div>
      </div>
    </div>
  );
}
