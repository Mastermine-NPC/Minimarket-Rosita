import type { ReactNode } from "react";

/** The original shared boundary; its renderer now belongs to the whole Home. */
export function LiquidVideos({ children }: { children: ReactNode }) {
  return <div className="liquid-videos" data-liquid="fallback">
    <canvas className="liquid-video-surface" aria-hidden="true" />{children}
  </div>;
}
