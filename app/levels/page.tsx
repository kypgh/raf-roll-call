import { redirect } from "next/navigation";

// Retired: levels are now managed inline on each student's profile (and in
// the add/edit form) via a live chip picker. There is no Levels screen.
export default function LevelsRedirect() {
  redirect("/roster");
}
