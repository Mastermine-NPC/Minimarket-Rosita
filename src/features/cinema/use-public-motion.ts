import { useLocation } from "react-router";
import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useMotionPreference } from "@/hooks/use-motion-preference";
gsap.registerPlugin(ScrollTrigger, SplitText);
export function usePublicMotion(pathname: string) {
  const reduced = useMotionPreference();
  const location = useLocation();
  useLayoutEffect(() => {
    if (reduced || pathname === "/" || /^\/(login|registro|personal)\/?$/.test(pathname) || location.state?.preserveCatalogScroll) return;
    const scope = document.querySelector(".public-route-content");
    if (!scope) return;
    let context: gsap.Context | undefined;
    let split: SplitText | undefined;
    let started = false;
    const start = () => {
      const heading = scope.querySelector("h1");
      if (!heading || scope.querySelector(".route-loading") || started) return;
      started = true;
      context = gsap.context(() => {
        gsap.from(scope, { y: 36, duration: 0.8, ease: "power3.out", clearProps: "transform" });
        // Stateful commerce headings remain React-owned (search, totals and checkout).
        if (/^\/(nosotros|contacto|ayuda|login|registro|personal)$/.test(pathname)) {
          split = SplitText.create(heading, { type: "words", mask: "words", aria: "auto" });
          gsap.from(split.words, { yPercent: 110, rotationX: -35, transformOrigin: "50% 100%", stagger: 0.045, duration: 0.85, ease: "power3.out" });
        } else {
          gsap.from(heading, { y: 28, clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "power3.out", clearProps: "clipPath,transform" });
        }
        gsap.utils.toArray<HTMLElement>(".info-story, .contact-grid, .auth-card, .cart-summary, .checkout-progress, .order-timeline, .detail-photo, .catalog-heading", scope).forEach((element, index) => {
          gsap.from(element, { y: 24, clipPath: index % 2 ? "inset(0 0 12% 0)" : "inset(0 0 0 8%)", duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 94%", once: true } });
        });
      }, scope);
    };
    start();
    const observer = new MutationObserver(start);
    observer.observe(scope, { childList: true, subtree: true });
    return () => { observer.disconnect(); context?.revert(); split?.revert(); };
  }, [pathname, reduced, location.state]);
}
