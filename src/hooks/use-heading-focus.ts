import { useCallback } from "react";
export function useHeadingFocus() {
  return useCallback((node: HTMLHeadingElement | null) => {
    node?.focus({ preventScroll: true });
  }, []);
}
