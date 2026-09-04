"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { todayString } from "@/lib/dates";

// Standalone/home-screen web apps resume their last URL when reopened
// instead of reloading the "/" start_url, so a day picked before the app
// was backgrounded stays showing. Catching the hidden -> visible
// transition here bounces back to today whenever the app is reopened.
export default function ResumeToToday({ date }: { date: string }) {
  const router = useRouter();

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      const today = todayString();
      if (date !== today) router.replace(`/day/${today}`);
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [date, router]);

  return null;
}
