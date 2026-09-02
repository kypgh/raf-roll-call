export default function StatTiles({
  present,
  away,
  out,
}: {
  present: number;
  away: number;
  out: number;
}) {
  const tiles = [
    { label: "Present", value: present, bg: "#E6FAF0", text: "#0B7A45" },
    { label: "Away", value: away, bg: "#FFF0F0", text: "#A81C25" },
    { label: "I was out", value: out, bg: "#FFF4DF", text: "#8A5A00" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-[18px] px-3 py-3 flex flex-col gap-1"
          style={{ background: t.bg }}
        >
          <span className="font-display text-2xl font-semibold" style={{ color: t.text }}>
            {t.value}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[.03em]" style={{ color: t.text }}>
            {t.label}
          </span>
        </div>
      ))}
    </div>
  );
}
