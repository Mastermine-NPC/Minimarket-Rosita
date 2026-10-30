import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
export function ColorBridge() {
  const ref = useRef<HTMLDivElement>(null),
    reduced = useMotionPreference(),
    { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"],
    }),
    scale = useTransform(scrollYProgress, [0, 1], [0.78, 1.08]);
  return (
    <div ref={ref} className="home-color-bridge" aria-hidden="true">
      <motion.div style={{ scale: reduced ? 1 : scale }} />
    </div>
  );
}
