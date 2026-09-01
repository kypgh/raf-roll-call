"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ACCENT } from "@/lib/colors";

const LINKS = [
  { label: "Week", href: "/week" },
  { label: "Students", href: "/students" },
  { label: "Levels", href: "/levels" },
  { label: "History", href: "/history" },
];

function sectionFor(pathname: string): string {
  if (pathname.startsWith("/session")) return "Week";
  const match = LINKS.find((l) => pathname.startsWith(l.href));
  return match?.label ?? "Week";
}

export default function Nav() {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) return null;

  const active = sectionFor(pathname);

  return (
    <header className="sticky top-0 z-10 bg-white border-b-2 border-line shadow-[0_3px_0_rgba(36,27,47,.03)]">
      <div className="hidden md:flex max-w-[720px] mx-auto px-6 h-[66px] items-center justify-between gap-3">
        <Link href="/week" className="flex items-center gap-2.5 no-underline">
          <span className="w-[34px] h-[34px] rounded-xl bg-purple shadow-[0_3px_0_#4A32C4] flex items-center justify-center text-white text-[17px] font-bold">
            ✓
          </span>
          <span className="font-display font-semibold text-[22px] text-ink tracking-tight">
            Roll Call
          </span>
        </Link>
        <nav className="flex items-center gap-1.5">
          {LINKS.map((l) => {
            const on = l.label === active;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="font-body text-[15px] font-medium no-underline px-3.5 py-2 rounded-full transition-transform hover:-translate-y-px"
                style={{
                  background: on ? NAV_ACCENT[l.label] : "transparent",
                  color: on ? "#FFFFFF" : "#5B5168",
                }}
              >
                {l.label}
              </Link>
            );
          })}
          <span className="w-0.5 h-[22px] bg-line mx-1" />
          <form action="/api/logout" method="post">
            <button
              type="submit"
              className="font-body text-sm font-medium text-faint px-2.5 py-2 rounded-full hover:text-red hover:bg-red-light"
            >
              Log out
            </button>
          </form>
        </nav>
      </div>

      <div className="flex md:hidden flex-col px-4 pt-2.5 pb-3 gap-2.5">
        <div className="flex items-center justify-between">
          <Link href="/week" className="flex items-center gap-2 no-underline">
            <span className="w-[30px] h-[30px] rounded-[11px] bg-purple shadow-[0_3px_0_#4A32C4] flex items-center justify-center text-white text-[15px] font-bold">
              ✓
            </span>
            <span className="font-display font-semibold text-[19px] text-ink">
              Roll Call
            </span>
          </Link>
          <form action="/api/logout" method="post">
            <button
              type="submit"
              className="font-body text-[13px] font-medium text-faint px-3 py-2.5 rounded-full bg-card2"
            >
              Log out
            </button>
          </form>
        </div>
        <div className="flex gap-1.5">
          {LINKS.map((l) => {
            const on = l.label === active;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex-1 text-center font-body text-[13px] font-semibold no-underline py-2.5 px-1 rounded-full"
                style={{
                  background: on ? NAV_ACCENT[l.label] : "transparent",
                  color: on ? "#FFFFFF" : "#5B5168",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
