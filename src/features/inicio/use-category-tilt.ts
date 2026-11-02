import { useEffect, type RefObject } from "react";
import gsap from "gsap";

type Tilt = {
  card: HTMLElement;
  x: number; y: number; active: number;
  targetX: number; targetY: number; targetActive: number;
};
const properties = ["x", "y", "active", "axis-x", "axis-y", "angle", "light-x", "light-y"];

/** Native category links, one shared GSAP ticker, no pointer-driven React state. */
export function useCategoryTilt(root: RefObject<HTMLDivElement | null>, signature: string) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const states = new Map<HTMLElement, Tilt>();
    host.querySelectorAll<HTMLElement>(".home-category-card.category-card").forEach(card => {
      states.set(card, { card, x: 0, y: 0, active: 0, targetX: 0, targetY: 0, targetActive: 0 });
      card.dataset.categoryTilt = "ready";
    });
    let running = false;
    function paint(state: Tilt) {
      const { card, x, y, active } = state;
      const axisX = -y * 2.4, axisY = x * 3.2;
      const values: Record<string, string> = {
        x: String(x), y: String(y), active: String(active),
        "axis-x": String(axisX), "axis-y": String(axisY),
        angle: `${Math.hypot(axisX, axisY)}deg`,
        "light-x": `${50 + x * 45}%`, "light-y": `${50 + y * 45}%`,
      };
      for (const name of properties) card.style.setProperty(`--category-tilt-${name}`, values[name]);
    }
    function tick(_time: number, delta: number) {
      const ease = 1 - Math.exp(-Math.min(delta, 64) / 100);
      let moving = false;
      for (const state of states.values()) {
        const unsettled = Math.abs(state.x - state.targetX) + Math.abs(state.y - state.targetY) + Math.abs(state.active - state.targetActive) > .001;
        if (unsettled) {
          state.x += (state.targetX - state.x) * ease;
          state.y += (state.targetY - state.y) * ease;
          state.active += (state.targetActive - state.active) * ease;
          moving = true;
          paint(state);
        } else if (state.x !== state.targetX || state.y !== state.targetY || state.active !== state.targetActive) {
          state.x = state.targetX; state.y = state.targetY; state.active = state.targetActive;
          paint(state);
        }
      }
      if (!moving) { gsap.ticker.remove(tick); running = false; }
    }
    function wake() { if (!running && !reduced.matches) { running = true; gsap.ticker.add(tick); } }
    function find(target: EventTarget | null) {
      const card = target instanceof Element ? target.closest<HTMLElement>(".home-category-card.category-card") : null;
      return card ? states.get(card) : undefined;
    }
    function reset(state: Tilt) { state.targetX = 0; state.targetY = 0; state.targetActive = 0; }
    function resetAll() { states.forEach(reset); wake(); }
    function mouse(event: PointerEvent) {
      if (reduced.matches || !fine.matches || event.pointerType !== "mouse") return;
      const state = find(event.target);
      if (!state) return;
      const bounds = state.card.getBoundingClientRect();
      state.targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      state.targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      state.targetActive = 1;
      wake();
    }
    function out(event: PointerEvent) {
      const state = find(event.target);
      if (state && !(event.relatedTarget instanceof Node && state.card.contains(event.relatedTarget))) { reset(state); wake(); }
    }
    function touch(event: PointerEvent) {
      if (event.pointerType === "mouse" || reduced.matches) return;
      const state = find(event.target);
      if (state) { state.targetX = 0; state.targetY = 0; state.targetActive = .35; wake(); }
    }
    function release(event: PointerEvent) {
      if (event.pointerType !== "mouse") resetAll();
    }
    function preference() {
      gsap.ticker.remove(tick); running = false;
      for (const state of states.values()) {
        reset(state); state.x = 0; state.y = 0; state.active = 0;
        for (const name of properties) state.card.style.removeProperty(`--category-tilt-${name}`);
      }
    }
    host.addEventListener("pointerover", mouse, { passive: true });
    host.addEventListener("pointermove", mouse, { passive: true });
    host.addEventListener("pointerout", out, { passive: true });
    host.addEventListener("pointerdown", touch, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    window.addEventListener("scroll", resetAll, { passive: true, capture: true });
    window.addEventListener("blur", resetAll);
    fine.addEventListener("change", preference); reduced.addEventListener("change", preference);
    return () => {
      gsap.ticker.remove(tick);
      host.removeEventListener("pointerover", mouse); host.removeEventListener("pointermove", mouse);
      host.removeEventListener("pointerout", out); host.removeEventListener("pointerdown", touch);
      window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release);
      window.removeEventListener("scroll", resetAll, true); window.removeEventListener("blur", resetAll);
      fine.removeEventListener("change", preference); reduced.removeEventListener("change", preference);
      for (const state of states.values()) {
        delete state.card.dataset.categoryTilt;
        for (const name of properties) state.card.style.removeProperty(`--category-tilt-${name}`);
      }
    };
  }, [root, signature]);
}
