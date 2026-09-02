import { AttendanceStatus } from "@/lib/types";

const GLYPH: Record<AttendanceStatus, string> = {
  present: "✓",
  absent: "✕",
  teacher_absent: "↻",
};

const COLOR: Record<AttendanceStatus, { bg: string; fg: string }> = {
  present: { bg: "#17C26B", fg: "#FFFFFF" },
  absent: { bg: "#FF4B55", fg: "#FFFFFF" },
  teacher_absent: { bg: "#FFB020", fg: "#241B2F" },
};

export default function StatusDisc({
  status,
  size = 30,
  onClick,
}: {
  status: AttendanceStatus | null;
  size?: number;
  onClick?: () => void;
}) {
  const style = status
    ? COLOR[status]
    : { bg: "transparent", fg: "#C9BFD4" };

  const content = (
    <span
      className="rounded-full flex items-center justify-center font-bold flex-none"
      style={{
        width: size,
        height: size,
        background: style.bg,
        color: style.fg,
        fontSize: size * 0.45,
        border: status ? "none" : "2px dashed #E0D3C4",
      }}
    >
      {status ? GLYPH[status] : ""}
    </span>
  );

  if (!onClick) return content;

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-none bg-transparent p-0 cursor-pointer"
      style={{ width: size, height: size }}
      aria-label="Change status"
    >
      {content}
    </button>
  );
}
