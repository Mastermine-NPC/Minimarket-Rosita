import { useCallback, useEffect, useRef, useState } from "react";
export const ROUTE_SIMULATION_MS = 10_000;
/** A monotonic clock drives Leaflet at display rate; React receives at most 10 updates/s. */
export function useRouteSimulation(onFrame: (progress: number) => void, onComplete?: () => void) {
  const completion = useRef(onComplete);
  useEffect(() => { completion.current = onComplete; }, [onComplete]);
  const clock = useRef({ elapsed: 0, started: 0, active: false, frame: 0, published: 0 });
  const [view, setView] = useState({ progress: 0, playing: false });
  const pause = useCallback(() => {
    const c = clock.current;
    if (!c.active) return;
    c.elapsed = Math.min(ROUTE_SIMULATION_MS, c.elapsed + performance.now() - c.started);
    c.active = false; cancelAnimationFrame(c.frame);
    onFrame(c.elapsed / ROUTE_SIMULATION_MS);
    setView({ progress: c.elapsed / ROUTE_SIMULATION_MS, playing: false });
  }, [onFrame]);
  const reset = useCallback(() => {
    const c = clock.current;
    cancelAnimationFrame(c.frame); c.active = false; c.elapsed = 0;
    onFrame(0); setView({ progress: 0, playing: false });
  }, [onFrame]);
  const start = useCallback(() => {
    const c = clock.current;
    if (c.active || c.elapsed >= ROUTE_SIMULATION_MS) return;
    c.active = true; c.started = performance.now(); c.published = 0;
    setView({ progress: c.elapsed / ROUTE_SIMULATION_MS, playing: true });
    const tick = (now: number) => {
      if (!c.active) return;
      const elapsed = Math.min(ROUTE_SIMULATION_MS, c.elapsed + now - c.started);
      const progress = elapsed / ROUTE_SIMULATION_MS;
      onFrame(progress);
      if (elapsed >= ROUTE_SIMULATION_MS) {
        c.elapsed = ROUTE_SIMULATION_MS; c.active = false;
        setView({ progress: 1, playing: false }); completion.current?.(); return;
      }
      if (now - c.published >= 100) { c.published = now; setView({ progress, playing: true }); }
      c.frame = requestAnimationFrame(tick);
    };
    c.frame = requestAnimationFrame(tick);
  }, [onFrame]);
  useEffect(() => () => { clock.current.active = false; cancelAnimationFrame(clock.current.frame); }, []);
  return { ...view, start, pause, reset };
}
