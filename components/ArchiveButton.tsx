"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveStudent } from "@/lib/actions";

type Phase = "idle" | "confirm" | "saving" | "done";

export default function ArchiveButton({
  studentId,
  studentName,
}: {
  studentId: number;
  studentName: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [, startTransition] = useTransition();

  function confirmArchive() {
    setPhase("saving");
    startTransition(async () => {
      await archiveStudent(studentId);
      setPhase("done");
      setTimeout(() => {
        router.push("/students");
        router.refresh();
      }, 700);
    });
  }

  if (phase === "done") {
    return (
      <div className="flex items-center gap-2.5 bg-green-light border-2 border-green-border rounded-2xl px-3.5 py-3">
        <span className="w-[22px] h-[22px] rounded-full bg-green text-white text-xs font-bold flex items-center justify-center flex-none">
          ✓
        </span>
        <span className="text-sm font-semibold text-green-darker">Archived. History kept.</span>
      </div>
    );
  }

  if (phase === "confirm" || phase === "saving") {
    return (
      <div className="bg-red-light border-2 border-red-border rounded-[20px] p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-display text-lg font-semibold text-red-text">
            Archive {studentName}?
          </span>
          <span className="text-sm text-red-text2">
            They&rsquo;ll disappear from Week and the roster. Every past session and note is
            preserved — you can bring them back any time.
          </span>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={() => setPhase("idle")}
            disabled={phase === "saving"}
            className="flex-1 min-w-[120px] min-h-[46px] border-2 border-red-border bg-white text-muted2 rounded-2xl font-body text-[15px] font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmArchive}
            disabled={phase === "saving"}
            className="flex-1 min-w-[120px] min-h-[46px] border-none bg-red text-white rounded-2xl font-body text-[15px] font-bold cursor-pointer shadow-[0_4px_0_#C22A33] active:translate-y-[3px] active:shadow-[0_1px_0_#C22A33] disabled:opacity-70"
          >
            {phase === "saving" ? "Archiving…" : "Yes, archive"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setPhase("confirm")}
      className="self-start bg-white border-2 border-red-border text-red-dark rounded-full min-h-[44px] px-[18px] font-body text-[15px] font-bold cursor-pointer hover:bg-red-light"
    >
      Archive student
    </button>
  );
}
