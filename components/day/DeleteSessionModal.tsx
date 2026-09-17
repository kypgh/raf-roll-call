"use client";

export default function DeleteSessionModal({
  title,
  description,
  isPending,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[rgba(36,27,47,.45)] px-4 pb-4 sm:pb-0"
      onClick={onCancel}
    >
      <div
        className="w-full sm:w-[360px] bg-white rounded-[24px] p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <span className="font-display text-lg font-semibold text-ink">{title}</span>
          <span className="text-sm text-muted">{description}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 min-h-[46px] border-2 border-line bg-white text-muted2 rounded-2xl font-body text-sm font-bold cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 min-h-[46px] border-none rounded-2xl bg-red text-white font-body text-[15px] font-bold cursor-pointer disabled:opacity-40"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
