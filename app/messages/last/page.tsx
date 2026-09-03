import Link from "next/link";
import { getLastMessageBatch } from "@/lib/actions";
import MessageResults from "@/components/messages/MessageResults";

export const dynamic = "force-dynamic";

export default async function LastMessagePage() {
  const batch = await getLastMessageBatch();

  return (
    <div className="bg-ink min-h-screen flex flex-col">
      <div className="flex items-center gap-2.5 px-[18px] md:px-7 pt-[18px] pb-3.5 flex-none">
        <span className="select-none font-display font-semibold text-xl text-paper flex-1">
          Last message
        </span>
        <Link
          href="/team"
          className="no-underline w-10 h-10 rounded-full bg-[rgba(255,246,236,.08)] hover:bg-[rgba(255,246,236,.16)] border-2 border-[rgba(255,246,236,.4)] flex items-center justify-center text-[15px] text-[#BBB0C6] flex-none transition-colors"
        >
          ✕
        </Link>
      </div>

      <div className="flex-1 bg-paper rounded-t-[32px] px-[18px] md:px-7 pt-[18px] pb-14">
        <div className="max-w-[640px] mx-auto">
          {batch ? (
            <MessageResults batch={batch} />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center py-16">
              <span className="font-display text-xl font-semibold">No message sent yet</span>
              <p className="m-0 text-sm text-muted max-w-[300px]">
                Select students from a day sheet or the Team page to compose a WhatsApp message.
              </p>
              <Link
                href="/team"
                className="no-underline text-sm font-bold text-purple-dark bg-purple-light2 rounded-full px-4 py-2.5 mt-1"
              >
                Go to Team
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
