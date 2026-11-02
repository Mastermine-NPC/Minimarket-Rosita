import { useLayoutEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

export function useSmoothScroll(pathname: string) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const scroll: Lenis = new Lenis({
        autoRaf: false, duration: 0.9, smoothWheel: true, syncTouch: false,
        // Honor native anchor/scrollbar moves before accepting another wheel delta.
        virtualScroll: () => {
          if (Math.abs(scroll.actualScroll - scroll.animatedScroll) > 3) scroll.scrollTo(scroll.actualScroll, { immediate: true, force: true });
          return true;
        },
        prevent: node => !!node.closest("[role=dialog], dialog, textarea, select, .leaflet-container, .home-carousel-viewport, [data-lenis-prevent]"),
      });
      scroll.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => scroll.raf(time * 1000);
      gsap.ticker.add(tick);
      return () => { gsap.ticker.remove(tick); scroll.destroy(); };
    });
    return () => media.revert();
  }, [pathname]);
}
