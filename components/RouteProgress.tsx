"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// No loading.tsx in the app -- Next.js then keeps the current page on
// screen and blocks the transition until the next one's data is ready,
// instead of swapping in a skeleton. This bar is the only feedback that
// something's happening: it eases in on link clicks and completes the
// moment the pathname/search actually changes.
export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const clearTimers = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      clearTimers();
      startedRef.current = true;
      setVisible(true);
      setWidth(0);
      requestAnimationFrame(() => setWidth(20));

      timerRef.current = setInterval(() => {
        setWidth((w) => (w < 85 ? w + (85 - w) * 0.1 : w));
      }, 200);
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!startedRef.current) return;
    startedRef.current = false;

    if (timerRef.current) clearInterval(timerRef.current);
    setWidth(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 250);

    return () => {
      if (hideRef.current) clearTimeout(hideRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full bg-purple"
        style={{
          width: `${width}%`,
          transition: "width 200ms ease-out",
          boxShadow: "0 0 8px rgba(107,78,255,.6)",
        }}
      />
    </div>
  );
}
