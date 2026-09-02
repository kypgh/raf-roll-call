import { redirect } from "next/navigation";

// Retired: the team list moved to /team (opened from the Day Sheet's
// Team pill), matching the design's "one door, top right" structure.
export default function StudentsRedirect() {
  redirect("/team");
}
