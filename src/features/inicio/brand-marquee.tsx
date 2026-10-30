import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMotionPreference } from "@/hooks/use-motion-preference";
export function BrandMarquee() {
  const [paused, Paused] = useState(false),
    reduced = useMotionPreference(),
    ref = useRef<HTMLDivElement>(null),
    track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let inView = true;
    const update = () => {
      if (track.current)
        track.current.style.animationPlayState =
          paused || document.hidden || !inView || reduced
            ? "paused"
            : "running";
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(root);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [paused, reduced]);
  return (
    <div className="home-marquee" ref={ref}>
      <p className="sr-only">Un poco de todo. Un mucho de Rosita.</p>
      <div className="home-marquee-window" aria-hidden="true">
        <div className="home-marquee-track" ref={track}>
          {[0, 1].map((copy) => (
            <div key={copy}>
              {[0, 1, 2].map((i) => (
                <span key={i}>
                  Un poco de todo. <b>Un mucho de Rosita.</b>
                  <i>✳</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        disabled={reduced}
        aria-label={
          reduced
            ? "Marquesina estática por movimiento reducido"
            : paused
              ? "Reanudar marquesina"
              : "Pausar marquesina"
        }
        aria-pressed={paused || reduced}
        onClick={() => Paused(!paused)}
      >
        {paused || reduced ? (
          <Play size={16} aria-hidden="true" />
        ) : (
          <Pause size={16} aria-hidden="true" />
        )}
        <span>{reduced ? "Estática" : paused ? "Reanudar" : "Pausar"}</span>
      </Button>
    </div>
  );
}
