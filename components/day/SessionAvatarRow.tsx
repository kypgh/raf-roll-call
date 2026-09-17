"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { removeAttendance } from "@/lib/actions";
import { avatarColor, initials } from "@/lib/colors";
import { friendlyTime } from "@/lib/dates";
import { useLongPress } from "@/lib/useLongPress";
import DeleteSessionModal from "./DeleteSessionModal";

// Same card shell the day page used to render inline as `StudentAvatarRow`,
// now a client component so it can hold the touch-and-hold delete gesture --
// only enabled when `attendanceId` is given, since that's the only case
// where there's an actual row to delete.
export default function SessionAvatarRow({
  studentId,
  studentName,
  time,
  date,
  attendanceId,
  subtitle,
  subtitleColor,
  right,
  borderColor,
  children,
}: {
  studentId: number;
  studentName: string;
  time: string | null;
  date?: string;
  attendanceId?: number | null;
  subtitle?: string;
  subtitleColor?: string;
  right?: React.ReactNode;
  borderColor?: string;
  children?: React.ReactNode;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();
  const av = avatarColor(studentId);

  const longPress = useLongPress(() => setConfirmingDelete(true), !attendanceId);

  function confirmDelete() {
    if (!attendanceId) return;
    startDeleteTransition(async () => {
      await removeAttendance(attendanceId);
      setConfirmingDelete(false);
      router.refresh();
    });
  }

  return (
    <>
      <div
        className="flex flex-col gap-2.5 rounded-[20px] px-4 py-4 select-none"
        style={{
          background: "#FFFFFF",
          border: `2px solid ${borderColor ?? "#F3E6D8"}`,
          WebkitTouchCallout: "none",
        }}
        {...longPress}
      >
        <div className="flex items-center gap-3">
          <Link
            href={date ? `/students/${studentId}?from=/day/${date}` : `/students/${studentId}`}
            className="no-underline text-inherit flex items-center gap-3 flex-1 min-w-0"
          >
            <span
              className="select-none w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center flex-none"
              style={{ background: av.bg, color: av.fg }}
            >
              {initials(studentName)}
            </span>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <span className="select-none text-[16px] font-bold truncate">{studentName}</span>
              <span
                className="select-none text-[12px] font-semibold"
                style={{ color: subtitleColor ?? "#7C7089" }}
              >
                {subtitle ?? (time ? friendlyTime(time) : "Drop-in")}
              </span>
            </div>
          </Link>
          {right}
        </div>
        {children}
      </div>

      {confirmingDelete && (
        <DeleteSessionModal
          title="Delete this session?"
          description={`${studentName} — ${subtitle ?? (time ? friendlyTime(time) : "Drop-in")}. This can't be undone.`}
          isPending={isDeleting}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
