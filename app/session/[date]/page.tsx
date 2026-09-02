import { redirect } from "next/navigation";

// Retired: the register moved to the Day Sheet + deck at /day/[date].
export default function SessionRedirect({ params }: { params: { date: string } }) {
  redirect(`/day/${params.date}`);
}
