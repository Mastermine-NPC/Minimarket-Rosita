import { useEffect, type RefObject } from "react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
export function useHomeReveals(ref: RefObject<HTMLDivElement | null>) {
  const reduced = useMotionPreference();
  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    root.classList.add("home-motion-ready");
    root.querySelector(".home-hero")?.classList.add("home-hero-enter");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("home-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    root
      .querySelectorAll("[data-home-reveal]")
      .forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      root.classList.remove("home-motion-ready");
      root.querySelector(".home-hero")?.classList.remove("home-hero-enter");
    };
  }, [ref, reduced]);
}
