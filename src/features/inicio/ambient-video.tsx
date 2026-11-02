import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/** Decorative background: content never depends on playback; no visible controls. */
export function AmbientVideo({ src, poster, label, automatic = true, loop = false, priority = false, enabled = true, keepPlaying = false }: {
  src: string; poster: string; label: string; automatic?: boolean;
  loop?: boolean; priority?: boolean; enabled?: boolean; keepPlaying?: boolean;
}) {
  const reduced = useMotionPreference();
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [playing, setPlaying] = useState(false);
  const [painted, setPainted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const blocked = useRef(false);
  const [limited] = useState(() => {
    const device = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
    return !!device.connection?.saveData || /(^|-)2g$/.test(device.connection?.effectiveType || "") || (device.deviceMemory !== undefined && device.deviceMemory <= 2);
  });
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      setVisible(inView);
      if ((inView || keepPlaying) && enabled && automatic && !reduced && !limited) setLoaded(true);
    }, { threshold: [0, 0.25] });
    if (root.current) observer.observe(root.current);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [automatic, enabled, reduced, limited, keepPlaying]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const desired = loaded && (visible || keepPlaying) && enabled && !hidden && !reduced && !limited && !failed;
    let alive = true;
    let pending = false;
    const resume = (gesture = false) => {
      if (!alive || !desired || pending || (blocked.current && !gesture) || !element.paused) return;
      pending = true;
      void element.play().then(() => { blocked.current = false; }).catch(error => {
        if (error?.name === "NotAllowedError") blocked.current = true;
        // AbortError from a quick visibility change is recovered by the next tick/canplay.
      }).finally(() => { pending = false; });
    };
    const ready = () => resume();
    const gesture = () => resume(true);
    if (desired) resume(); else element.pause();
    element.addEventListener("canplay", ready);
    element.addEventListener("loadeddata", ready);
    element.addEventListener("stalled", ready);
    document.addEventListener("pointerdown", gesture, { passive: true });
    const watchdog = desired ? window.setInterval(() => {
      if (element.readyState >= 2) resume();
    }, 2000) : undefined;
    return () => {
      alive = false;
      clearInterval(watchdog);
      element.removeEventListener("canplay", ready);
      element.removeEventListener("loadeddata", ready);
      element.removeEventListener("stalled", ready);
      document.removeEventListener("pointerdown", gesture);
    };
  }, [loaded, visible, enabled, hidden, reduced, limited, failed, keepPlaying]);
  useEffect(() => {
    const element = video.current;
    return () => element?.pause();
  }, []);
  return <div className="ambient-video cinema-background" ref={root} data-video={label} data-state={failed ? "failed" : waiting ? "waiting" : playing ? "playing" : "static"}>
    <img src={poster} alt="" aria-hidden="true" width={1280} height={720} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} />
    <video ref={video} src={loaded ? src : undefined} poster={poster} muted playsInline loop={loop} preload={priority ? "metadata" : "none"} aria-hidden="true" tabIndex={-1}
      onPlaying={() => { setPlaying(true); setPainted(true); setWaiting(false); }}
      onPause={() => setPlaying(false)} onWaiting={() => setWaiting(true)} onError={() => { setFailed(true); setWaiting(false); }} className={painted && !failed ? "is-playing" : ""} />
  </div>;
}
