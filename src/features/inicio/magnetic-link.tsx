import type { ReactNode, MouseEventHandler } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Link } from "react-router";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { useMediaQuery } from "@/hooks/use-media-query";
import { homeMotion } from "./home-motion";
export function MagneticLink({
  to,
  children,
  secondary = false,
  onClick,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const reduced = useMotionPreference(),
    fine = useMediaQuery("(hover: hover) and (pointer: fine)"),
    x = useMotionValue(0),
    y = useMotionValue(0),
    sx = useSpring(x, homeMotion.spring),
    sy = useSpring(y, homeMotion.spring);
  return (
    <Link
      to={to}
      data-cursor="Explorar"
      className={
        "home-magnetic " +
        (secondary ? "home-magnetic-secondary" : "home-magnetic-primary")
      }
      onClick={onClick}
      onPointerMove={(e) => {
        if (reduced || !fine || e.pointerType === "touch") return;
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(
          Math.max(
            -homeMotion.magnet,
            Math.min(
              homeMotion.magnet,
              (e.clientX - rect.left - rect.width / 2) * 0.08,
            ),
          ),
        );
        y.set(
          Math.max(
            -homeMotion.magnet,
            Math.min(
              homeMotion.magnet,
              (e.clientY - rect.top - rect.height / 2) * 0.08,
            ),
          ),
        );
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onFocus={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.span style={{ x: reduced ? 0 : sx, y: reduced ? 0 : sy }}>
        {children}
      </motion.span>
    </Link>
  );
}
