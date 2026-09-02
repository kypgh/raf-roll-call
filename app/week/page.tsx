import { redirect } from "next/navigation";
import { todayString } from "@/lib/dates";

// Retired: the Day Sheet's date rail now covers this (and unbounded history
// backwards), so /week just sends old links/bookmarks home.
export default function WeekRedirect() {
  redirect(`/day/${todayString()}`);
}
