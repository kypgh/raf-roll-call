import { supabaseServer } from "@/lib/supabase";
import StudentForm from "@/components/StudentForm";

export const dynamic = "force-dynamic";

export default async function NewStudentPage() {
  const supabase = supabaseServer();
  const { data: levels } = await supabase
    .from("levels")
    .select("id, name")
    .order("sort_order", { ascending: true });

  return <StudentForm levels={levels ?? []} />;
}
