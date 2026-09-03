"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markMessageRecipientSent } from "@/lib/actions";
import { avatarColor, initials } from "@/lib/colors";
import { friendlyDateTime } from "@/lib/dates";
import { whatsAppLink } from "@/lib/whatsapp";
import { MessageBatch } from "@/lib/types";

function sourceLabel(source: string | null): string {
  if (!source) return "";
  if (source.startsWith("day:")) return `From the day sheet · ${source.slice(4)}`;
  if (source === "team") return "Selected from Team";
  return source;
}

export default function MessageResults({ batch }: { batch: MessageBatch }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const sendable = batch.recipients.filter((r) => !!r.phone);
  const skipped = batch.recipients.filter((r) => !r.phone);
  const sentCount = sendable.filter((r) => r.sent).length;

  function markSent(studentId: number) {
    startTransition(async () => {
      await markMessageRecipientSent(studentId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-semibold text-[26px] leading-[1.05] tracking-tight m-0">
          Last message
        </h1>
        <p className="m-0 text-sm text-muted">
          {sourceLabel(batch.source)} · sent {friendlyDateTime(batch.createdAt)}
        </p>
        <p className="m-0 text-sm text-muted2 font-semibold">
          {sentCount} of {sendable.length} marked sent
        </p>
      </div>

      <div className="bg-white border-2 border-line rounded-2xl px-3.5 py-3">
        <span className="text-[11px] font-bold uppercase tracking-[.06em] text-faint2">
          Template
        </span>
        <p className="m-0 mt-1 text-sm text-muted2 whitespace-pre-wrap">{batch.template}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {sendable.map((r) => {
          const av = avatarColor(r.studentId);
          return (
            <div
              key={r.studentId}
              className="bg-white border-2 rounded-[20px] px-4 py-3.5 flex flex-col gap-2.5"
              style={{ borderColor: r.sent ? "#A6EBC8" : "#F3E6D8" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full text-[13px] font-bold flex items-center justify-center flex-none"
                  style={{ background: av.bg, color: av.fg }}
                >
                  {initials(r.name)}
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-[15px] font-bold truncate">{r.name}</span>
                  {r.sent && r.sentAt && (
                    <span className="text-[11px] font-bold text-green-darker">
                      Sent · {friendlyDateTime(r.sentAt)}
                    </span>
                  )}
                </div>
              </div>

              <p className="m-0 text-sm text-muted2 whitespace-pre-wrap">{r.message}</p>

              <div className="flex items-center gap-2">
                <a
                  href={whatsAppLink(r.phone!, r.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 no-underline flex items-center justify-center gap-1.5 bg-green-light text-green-darker font-bold text-sm rounded-full py-2.5 hover:bg-green-border transition-colors"
                >
                  Send on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => markSent(r.studentId)}
                  disabled={isPending || r.sent}
                  className="text-sm font-bold rounded-full px-3.5 py-2.5 cursor-pointer border-2 border-line bg-white text-muted2 hover:border-green disabled:opacity-50 disabled:cursor-default transition-colors"
                >
                  {r.sent ? "✓ Done" : "Mark sent"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {skipped.length > 0 && (
        <div className="border-2 border-dashed border-linesoft rounded-2xl px-4 py-3.5 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[.07em] text-faint2">
            Skipped — no phone on file
          </span>
          <p className="m-0 text-sm text-muted2">{skipped.map((r) => r.name).join(", ")}</p>
        </div>
      )}
    </div>
  );
}
