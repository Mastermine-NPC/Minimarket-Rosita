import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { homeMotion } from "./home-motion";
export function PresentationCursor() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)"),
    reduced = useMotionPreference();
  return fine && !reduced ? <FineCursor /> : null;
}
function FineCursor() {
  const ref = useRef<HTMLDivElement>(null),
    label = useRef<HTMLSpanElement>(null),
    x = useMotionValue(-100),
    y = useMotionValue(-100),
    sx = useSpring(x, homeMotion.cursorSpring),
    sy = useSpring(y, homeMotion.cursorSpring);
  useEffect(() => {
    const hide = () => {
      if (ref.current) ref.current.dataset.visible = "false";
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        hide();
        return;
      }
      const target = event.target;
      if (
        !(target instanceof Element) ||
        target.closest(
          '[data-no-cursor],input,textarea,select,label,[contenteditable],.native-selection,[data-slot="sheet-content"],[data-slot="dialog-content"],[data-slot="sheet-overlay"],[data-slot="dialog-overlay"]',
        ) ||
        window.getSelection()?.toString()
      ) {
        hide();
        return;
      }
      const interactive = target.closest('a,button,[role="button"]');
      if (!interactive && target.closest("p,h1,h2,h3,small")) {
        hide();
        return;
      }
      x.set(event.clientX);
      y.set(event.clientY);
      if (!ref.current) return;
      ref.current.dataset.visible = "true";
      ref.current.dataset.theme = target.closest('[data-cursor-theme="dark"]')
        ? "dark"
        : "light";
      ref.current.dataset.expanded =
        interactive || target.closest("img,.product-image") ? "true" : "false";
      const explicit = interactive?.getAttribute("data-cursor");
      const text =
        explicit ||
        (interactive?.matches('button[aria-label^="Agregar al carrito"]')
          ? "Agregar"
          : interactive?.tagName === "A"
            ? "Ver"
            : "");
      if (label.current && label.current.textContent !== text)
        label.current.textContent = text;
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("keydown", hide);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    document.addEventListener("focusin", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("keydown", hide);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
      document.removeEventListener("focusin", hide);
    };
  }, [x, y]);
  return (
    <motion.div
      ref={ref}
      className="presentation-cursor"
      data-visible="false"
      data-theme="light"
      aria-hidden="true"
      style={{ x: sx, y: sy }}
    >
      <div>
        <span ref={label} />
      </div>
    </motion.div>
  );
}
