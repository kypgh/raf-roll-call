"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { unresolveMakeup } from "@/lib/actions";

export default function UndoMakeupButton({ makeupId }: { makeupId: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await unresolveMakeup(makeupId);
          router.refresh();
        })
      }
      className="bg-transparent border-none text-[13px] font-bold text-faint cursor-pointer px-1 hover:text-ink flex-none"
    >
      Undo
    </button>
  );
}
