import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { Button } from "@/components/ui/button";
/** Silent, supplemental media. Text/CTA never depend on playback. */
export function AmbientVideo({
  src,
  poster,
  label,
  automatic = true,
}: {
  src: string;
  poster: string;
  label: string;
  automatic?: boolean;
}) {
  const reduced = useMotionPreference(),
    root = useRef<HTMLDivElement>(null),
    video = useRef<HTMLVideoElement>(null),
    [visible, Visible] = useState(false),
    [hidden, Hidden] = useState(document.hidden),
    [requested, Requested] = useState(false),
    [paused, Paused] = useState(false),
    [playing, Playing] = useState(false),
    [failed, Failed] = useState(false),
    [blocked, Blocked] = useState(false);
  const load = !failed && ((automatic && !reduced && visible) || requested);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => Visible(e.isIntersecting), {
      threshold: 0.15,
    });
    if (root.current) o.observe(root.current);
    const f = () => Hidden(document.hidden);
    document.addEventListener("visibilitychange", f);
    return () => {
      o.disconnect();
      document.removeEventListener("visibilitychange", f);
    };
  }, []);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let alive = true;
    if (load && visible && !hidden && !paused && !blocked) {
      v.play().catch(() => {
        if (alive) Blocked(true);
      });
    } else v.pause();
    return () => {
      alive = false;
      v.pause();
    };
  }, [load, visible, hidden, paused, blocked]);
  return (
    <div
      className="ambient-video native-selection"
      ref={root}
      data-video={label}
      data-state={
        failed ? "failed" : blocked ? "blocked" : playing ? "playing" : "static"
      }
    >
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        width={960}
        height={540}
        loading={automatic ? "eager" : "lazy"}
      />
      <video
        ref={video}
        src={load ? src : undefined}
        poster={poster}
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => Playing(true)}
        onPause={() => Playing(false)}
        onEnded={() => {
          Paused(true);
          Playing(false);
        }}
        onError={() => Failed(true)}
        className={playing ? "is-playing" : ""}
      />
      <Button
        type="button"
        variant="outline"
        className="video-control"
        disabled={failed}
        onClick={() => {
          if (playing) {
            Paused(true);
          } else {
            if (video.current?.ended) video.current.currentTime = 0;
            Requested(true);
            Paused(false);
            Blocked(false);
          }
        }}
        aria-label={(playing ? "Pausar " : "Reproducir ") + label}
      >
        {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        {playing ? "Pausar" : "Reproducir"} video
      </Button>
      {(failed || blocked) && (
        <p role="status" className="video-notice">
          {failed
            ? "Video no disponible. Se conserva la imagen."
            : "Reproducción automática bloqueada. Puedes intentar reproducir."}
        </p>
      )}
    </div>
  );
}
