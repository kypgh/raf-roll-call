import { redirect } from "next/navigation";
import { todayString } from "@/lib/dates";

export default function RootPage() {
  redirect(`/day/${todayString()}`);
}
