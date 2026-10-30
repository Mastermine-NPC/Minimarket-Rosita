import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";
import { useMotionPreference } from "./use-motion-preference";
const positions = new Map<string, number>();
export function useStoreScroll() {
  const location = useLocation(),
    type = useNavigationType(),
    reduced = useMotionPreference(),
    previous = useRef(location.pathname);
  useLayoutEffect(() => {
    const key = location.key;
    let last = positions.get(key) || 0,
      frame = 0;
    const keep = type === "REPLACE" && previous.current === location.pathname;
    previous.current = location.pathname;
    const restore = () => {
      if (
        location.pathname === "/" &&
        !document.querySelector(".home-experience")
      )
        return false;
      let anchor = location.hash.slice(1);
      try {
        anchor = decodeURIComponent(anchor);
      } catch {
        /* El ancla inválida no debe impedir navegar. */
      }
      const target = location.hash ? document.getElementById(anchor) : null;
      if (location.hash && !target && document.querySelector(".route-loading"))
        return false;
      if (type === "POP" && positions.has(key))
        window.scrollTo({ top: positions.get(key)!, behavior: "instant" });
      else if (target) {
        target.focus({ preventScroll: true });
        target.scrollIntoView({
          block: "start",
          behavior: reduced ? "instant" : "smooth",
        });
      } else if (!keep) window.scrollTo({ top: 0, behavior: "instant" });
      last = window.scrollY;
      return true;
    };
    const observer = new MutationObserver(() => {
      if (restore()) observer.disconnect();
    });
    if (!restore())
      observer.observe(document.getElementById("contenido") || document.body, {
        subtree: true,
        childList: true,
      });
    const update = () => {
      last = window.scrollY;
      positions.set(key, last);
    };
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("click", update, true);
    return () => {
      positions.set(key, last);
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("click", update, true);
      if (positions.size > 50) positions.delete(positions.keys().next().value!);
    };
  }, [location.key, location.pathname, location.hash, type, reduced]);
}
