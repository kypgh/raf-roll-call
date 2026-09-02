import { redirect } from "next/navigation";

// Retired: the roster list moved to /roster (opened from the Day Sheet's
// Roster pill), matching the design's "one door, top right" structure.
export default function StudentsRedirect() {
  redirect("/roster");
}
