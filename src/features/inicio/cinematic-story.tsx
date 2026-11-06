import { useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { liquidReveal } from "./liquid-shaders";
import { CinematicChapter } from "./cinematic-chapter";
import { cinematicChapters } from "./cinematic-chapters";
import { useTaxonomy } from "@/hooks/use-taxonomy";
gsap.registerPlugin(ScrollTrigger);
export function CinematicStory() {
  const pinned = useMediaQuery("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [current, setCurrent] = useState(0);
  const { activeCategories, categoryPath } = useTaxonomy();
  const chapters = cinematicChapters.filter(chapter => activeCategories.some(category => category.id === chapter.category));
  const signature = chapters.map(chapter => chapter.id).join(",");
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const stage = root.current;
      if (!stage) return;
      const panels = gsap.utils.toArray<HTMLElement>(".cinema-scene", stage);
      if (!panels.length) return;
      stage.classList.add("is-pinned");
      gsap.set(panels, { zIndex: index => index + 1 });
      panels.forEach((panel, index) => { panel.dataset.liquidProgress = index === 0 ? "1" : "0"; });
      gsap.set(panels.slice(1), { clipPath: liquidReveal(0, 0) });
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: stage, start: "top top",
        end: () => `+=${innerHeight * Math.max(1, panels.length - 1) * 0.85}`,
        pin: true, scrub: 0.65, invalidateOnRefresh: true,
        onUpdate: self => {
          const index = Math.min(panels.length - 1, Math.floor(self.progress * (panels.length - 1) + 0.55));
          setCurrent(previous => previous === index ? previous : index);
        },
      }});
      trigger.current = timeline.scrollTrigger || null;
      panels.slice(1).forEach((panel, i) => {
        const at = i;
        const surface = { progress: 0 };
        timeline.to(panels[i].querySelector(".cinema-scene-camera"), { scale: 1.22, xPercent: -12, rotationY: -8, ease: "none", duration: 1 }, at)
          .to(panels[i].querySelector(".cinema-scene-content"), { xPercent: -18, opacity: 0, ease: "none", duration: 0.6 }, at)
          .to(surface, { progress: 1, duration: 1, ease: "power2.inOut", onUpdate: () => {
            panel.style.clipPath = liquidReveal(surface.progress, performance.now() / 1000);
            panel.dataset.liquidProgress = String(surface.progress);
          } }, at)
          .from(panel.querySelector(".cinema-scene-camera"), { xPercent: 30, scale: 1.35, rotationY: 9, duration: 1, ease: "none" }, at)
          .from(panel.querySelectorAll(".cinema-word"), { yPercent: 115, rotation: 4, stagger: 0.055, duration: 0.45, ease: "power3.out" }, at + 0.35)
          .from(panel.querySelectorAll(".cinema-scene-content > p, .cinema-explore, .cinema-film-picker"), { y: 30, opacity: 0, stagger: 0.07, duration: 0.4 }, at + 0.55);
      });
      const ready = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(ready);
        trigger.current = null;
        stage.classList.remove("is-pinned");
        panels.forEach(panel => { panel.style.removeProperty("clip-path"); delete panel.dataset.liquidProgress; });
      };
    });
    return () => media.revert();
  }, [signature]);
  function go(index: number) {
    const sequence = trigger.current;
    if (sequence) window.scrollTo({ top: sequence.start + (sequence.end - sequence.start) * index / Math.max(1, chapters.length - 1), behavior: "smooth" });
    else document.getElementById(chapters[index].id)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <div className="cinema-story home-opening" ref={root} data-cinematic-story>
    {chapters.map((chapter, index) => <CinematicChapter key={chapter.id} chapter={chapter} to={categoryPath(activeCategories.find(category => category.id === chapter.category)!)} active={!pinned || current === index} opening={index === 0} />)}
    <nav className="cinema-scene-navigation" aria-label="Escenas de Rosita">
      {chapters.map((chapter, index) => <button key={chapter.id} onClick={() => go(index)} aria-current={current === index ? "step" : undefined}>{chapter.films[0].name}</button>)}
    </nav>
  </div>;
}
