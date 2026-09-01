"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SHAPES = [
  { bg: "#FF4FA3", shadow: "#C4126F", radius: "16px", delay: "0s" },
  { bg: "#FFB020", shadow: "#C07C00", radius: "999px", delay: ".2s" },
  { bg: "#12B5E5", shadow: "#0A7EA0", radius: "16px", delay: ".4s" },
  { bg: "#17C26B", shadow: "#0E9A54", radius: "999px", delay: ".6s" },
];

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/week");
      router.refresh();
    } else {
      setError("That code isn't right.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6 py-10 font-body text-ink">
      <div className="w-full max-w-[340px] flex flex-col items-center gap-5">
        <div className="flex gap-2.5 items-end">
          {SHAPES.map((s, i) => (
            <span
              key={i}
              className="w-[42px] h-[42px]"
              style={{
                background: s.bg,
                borderRadius: s.radius,
                boxShadow: `0 4px 0 ${s.shadow}`,
                animation: `rc-bob 2.4s ease-in-out ${s.delay} infinite`,
              }}
            />
          ))}
        </div>

        <form
          onSubmit={submit}
          className="w-full bg-white border-2 border-line rounded-[28px] shadow-[0_6px_0_#F3E6D8] px-[22px] py-[26px] flex flex-col gap-4"
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple shadow-[0_3px_0_#4A32C4] flex items-center justify-center text-white text-base font-bold">
                ✓
              </span>
              <span className="font-display font-semibold text-[28px] tracking-tight">
                Roll Call
              </span>
            </div>
            <p className="m-0 text-sm text-muted">Enter your code to continue</p>
          </div>

          <input
            autoFocus
            type="password"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="••••"
            className="min-h-[60px] box-border text-center tracking-[.35em] font-body text-2xl font-bold text-ink bg-offwhite border-2 border-line rounded-[18px] px-3.5 outline-none focus:border-purple focus:bg-white"
          />

          {error && (
            <div className="flex items-center gap-2 bg-red-light border-2 border-red-border rounded-2xl px-3 py-2.5">
              <span className="w-5 h-5 rounded-full bg-red text-white text-xs font-bold flex items-center justify-center flex-none">
                !
              </span>
              <span className="text-sm font-semibold text-red-text">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code}
            className="min-h-[54px] border-none rounded-2xl bg-purple text-white font-body text-[17px] font-bold cursor-pointer shadow-[0_5px_0_#4A32C4] transition-transform active:translate-y-1 active:shadow-[0_1px_0_#4A32C4] disabled:opacity-50 disabled:cursor-default"
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
          {!code && !error && (
            <span className="text-center text-xs text-faint2">
              Disabled until you type a code
            </span>
          )}
        </form>
      </div>
    </main>
  );
}
