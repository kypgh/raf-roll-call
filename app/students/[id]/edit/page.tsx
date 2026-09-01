import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import StudentForm from "@/components/StudentForm";

export const dynamic = "force-dynamic";

export default async function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const supabase = supabaseServer();

  const [{ data: student }, { data: levels }, { data: schedules }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).maybeSingle(),
    supabase.from("levels").select("id, name").order("sort_order", { ascending: true }),
    supabase
      .from("student_schedules")
      .select("day, time")
      .eq("student_id", id)
      .order("day", { ascending: true }),
  ]);

  if (!student) notFound();

  return (
    <StudentForm
      levels={levels ?? []}
      studentId={id}
      studentName={student.name}
      initial={{
        name: student.name ?? "",
        parent: student.parent ?? "",
        phone: student.phone ?? "",
        age: student.age != null ? String(student.age) : "",
        level_id: student.level_id != null ? String(student.level_id) : "",
        notes: student.notes ?? "",
        schedules: (schedules ?? []).map((s: any) => ({
          day: s.day,
          time: s.time ? s.time.slice(0, 5) : "",
        })),
      }}
    />
  );
}
