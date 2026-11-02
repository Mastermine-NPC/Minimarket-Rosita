import { useEffect, type RefObject } from "react";
import { createLiquidHome } from "./liquid-home-engine";

export function useLiquidHome(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!root.current) return;
    return createLiquidHome(root.current);
  }, [root]);
}
