import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigationKey } from "@/hooks/use-navigation-key";
/** Navigation invalidates open state. Only entering the top strip or its accessible button opens it. */
export function useSmartHeader(locked: boolean, onNavigate: () => void) {
  const navigationKey = useNavigationKey();
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const open = openedFor === navigationKey;
  const rootRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const inActivation = useRef(false);
  const hold = useCallback(() => clearTimeout(timer.current), []);
  const inside = useCallback((point: { x: number; y: number } | null) => {
    const rect = rootRef.current?.querySelector(".navigation-discover")?.getBoundingClientRect();
    return !!point && !!rect && point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
  }, []);
  const close = useCallback(() => {
    hold();
    inActivation.current = inside(pointer.current);
    setOpenedFor(null);
  }, [hold, inside]);
  const reveal = useCallback(() => { hold(); setOpenedFor(navigationKey); }, [hold, navigationKey]);
  const hide = useCallback(() => {
    hold();
    if (!open) return;
    timer.current = setTimeout(() => {
      if (!locked && !rootRef.current?.matches(":hover") && !rootRef.current?.querySelector(".smart-navigation-panel")?.contains(document.activeElement)) setOpenedFor(null);
    }, 650);
  }, [hold, locked, open]);
  const toggle = useCallback(() => {
    hold(); inActivation.current = inside(pointer.current);
    setOpenedFor(value => value === navigationKey ? null : navigationKey);
  }, [hold, inside, navigationKey]);
  useEffect(() => { hold(); }, [locked, hold]);
  useEffect(() => {
    hold();
    inActivation.current = inside(pointer.current);
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const point = { x: event.clientX, y: event.clientY };
      if (!pointer.current && event.movementX === 0 && event.movementY === 0) {
        pointer.current = point; inActivation.current = inside(point); return;
      }
      if (pointer.current?.x === point.x && pointer.current?.y === point.y) return;
      pointer.current = point;
      const next = inside(point);
      const entered = next && !inActivation.current;
      inActivation.current = next;
      const activation = rootRef.current?.querySelector(".navigation-discover");
      if (entered && event.target instanceof Node && activation?.contains(event.target)) reveal();
    };
    const dismiss = () => { close(); onNavigate(); };
    const link = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      if (new URL(anchor.href, window.location.href).origin === window.location.origin) dismiss();
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("click", link, true);
    window.addEventListener("popstate", dismiss);
    return () => {
      hold(); document.removeEventListener("pointermove", move);
      document.removeEventListener("click", link, true); window.removeEventListener("popstate", dismiss);
    };
  }, [close, hold, inside, onNavigate, reveal]);
  return { rootRef, open, hold, hide, toggle, close };
}
