import { NavigationKeyContext } from "@/hooks/use-navigation-key";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, type Location } from "react-router";
import gsap from "gsap";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/** Holds the outgoing route until its shutter closes, including Back/Forward navigation. */
export function RouteTransition({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation();
  const [displayed, setDisplayed] = useState(location);
  const displayedPath = useRef(location.pathname);
  const curtain = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const publicRoute = !/^\/(admin|caja)(\/|$)/.test(location.pathname);
  useLayoutEffect(() => {
    if (location.pathname === displayedPath.current) return;
    const layer = curtain.current;
    let observer: MutationObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    const timeline = gsap.timeline();
    const outgoing = document.querySelector(".cinema-story.is-pinned .cinema-scene:not([aria-hidden='true']) .cinema-scene-content") || document.querySelector("#contenido h1");
    const reveal = () => {
      observer?.disconnect();
      if (timeout) clearTimeout(timeout);
      timeline.to(layer, { clipPath: "inset(0% 0 100% 0)", duration: 0.65, ease: "power3.inOut", onComplete: () => {
        if (layer) layer.style.pointerEvents = "none";
      }});
    };
    const swap = () => {
      displayedPath.current = location.pathname;
      setDisplayed(location);
      frame = requestAnimationFrame(() => {
        const ready = () => !document.querySelector(".route-loading") && document.querySelector(".public-route-content")?.getAttribute("data-route-path") === location.pathname && !!document.querySelector("#contenido h1");
        observer = new MutationObserver(() => { if (ready()) reveal(); });
        observer.observe(document.getElementById("root")!, { childList: true, subtree: true });
        if (ready()) reveal();
        else timeout = setTimeout(reveal, 2200);
      });
    };
    const authSwitch = /^\/(login|registro)\/?$/.test(displayedPath.current) && /^\/(login|registro)\/?$/.test(location.pathname);
    if (authSwitch || reduced || !publicRoute || !layer || location.state?.preserveCatalogScroll) {
      frame = requestAnimationFrame(() => { displayedPath.current = location.pathname; setDisplayed(location); });
    } else {
      layer.style.pointerEvents = "auto";
      gsap.set(layer, { clipPath: "inset(100% 0 0% 0)" });
      timeline.to(outgoing, { y: -24, opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
        .to(layer, { clipPath: "inset(0% 0 0% 0)", duration: 0.42, ease: "power3.inOut", onComplete: swap }, 0);
    }
    return () => {
      timeline.kill(); observer?.disconnect(); cancelAnimationFrame(frame);
      if (timeout) clearTimeout(timeout);
      if (layer) { gsap.set(layer, { clipPath: "inset(0% 0 100% 0)" }); layer.style.pointerEvents = "none"; }
      if (outgoing) gsap.set(outgoing, { clearProps: "transform,opacity" });
    };
  }, [location, reduced, publicRoute]);
  const effective = location.pathname === displayed.pathname ? location : displayed;
  return <NavigationKeyContext.Provider value={location.key}>{children(effective)}<div ref={curtain} className="cinema-route-curtain" aria-hidden="true"><span>Rosita.</span></div></NavigationKeyContext.Provider>;
}
