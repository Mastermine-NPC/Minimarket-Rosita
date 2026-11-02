import { useLayoutEffect, type RefObject } from "react";
/** Publish the actual visible bottom edge, including the header's slide transition. */
export function useHeaderClearance(rootRef: RefObject<HTMLDivElement | null>, open: boolean) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const shell = root?.closest<HTMLElement>(".store-shell");
    const trigger = root?.querySelector<HTMLElement>(".navigation-discover");
    const panel = root?.querySelector<HTMLElement>(".smart-navigation-panel");
    if (!shell || !trigger || !panel) return;
    let frame = 0;
    const update = () => {
      const visiblePanel = getComputedStyle(panel).visibility !== "hidden";
      const bottom = Math.max(trigger.getBoundingClientRect().bottom, visiblePanel ? panel.getBoundingClientRect().bottom : 0);
      shell.style.setProperty("--store-header-clearance", `${Math.ceil(Math.max(0, bottom))}px`);
    };
    const watch = () => {
      update();
      if (panel.getAnimations().some(animation => animation.playState === "running")) frame = requestAnimationFrame(watch);
    };
    const start = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(watch); };
    const observer = new ResizeObserver(() => { update(); start(); });
    observer.observe(trigger); observer.observe(panel);
    panel.addEventListener("transitionrun", start);
    panel.addEventListener("transitionend", update);
    window.addEventListener("resize", start);
    window.visualViewport?.addEventListener("resize", start);
    update(); start();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      panel.removeEventListener("transitionrun", start); panel.removeEventListener("transitionend", update);
      window.removeEventListener("resize", start); window.visualViewport?.removeEventListener("resize", start);
    };
  }, [rootRef, open]);
}
