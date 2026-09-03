"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeAttendance } from "@/lib/actions";

export default function RemoveDropInButton({ attendanceId }: { attendanceId: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function remove() {
    if (!confirm("Remove this drop-in from today?")) return;
    startTransition(async () => {
      await removeAttendance(attendanceId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={isPending}
      className="flex-none rounded-full border-2 border-red-border bg-red-light px-3 py-1.5 text-xs font-bold text-red-text cursor-pointer hover:bg-red hover:text-white hover:border-red transition-colors disabled:opacity-40"
    >
      Remove
    </button>
  );
}
