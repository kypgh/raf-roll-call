import { useCallback, useRef } from "react";

const LONG_PRESS_MS = 500;
// Past this much finger movement, treat it as a scroll rather than a hold.
const MOVE_CANCEL_PX = 10;

// Fires `onLongPress` after a touch-and-hold, and swallows the synthetic
// click/context-menu that mobile browsers otherwise send once the finger
// lifts -- without that, a fired long-press would also open the student's
// profile link (the click) or the browser's link callout (the context menu).
export function useLongPress(onLongPress: () => void, disabled?: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const start = useCallback(
    (x: number, y: number) => {
      if (disabled) return;
      firedRef.current = false;
      startPos.current = { x, y };
      clear();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
        onLongPress();
      }, LONG_PRESS_MS);
    },
    [disabled, onLongPress, clear]
  );

  const move = useCallback(
    (x: number, y: number) => {
      if (!startPos.current) return;
      if (Math.hypot(x - startPos.current.x, y - startPos.current.y) > MOVE_CANCEL_PX) clear();
    },
    [clear]
  );

  return {
    onTouchStart: (e: React.TouchEvent) => start(e.touches[0].clientX, e.touches[0].clientY),
    onTouchMove: (e: React.TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: (e: React.TouchEvent) => {
      clear();
      if (firedRef.current) e.preventDefault();
    },
    onTouchCancel: clear,
    onContextMenu: (e: React.MouseEvent) => {
      if (firedRef.current) e.preventDefault();
    },
  };
}
