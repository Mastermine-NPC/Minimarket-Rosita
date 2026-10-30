import { useMemo } from "react";
import { currentProducts } from "@/lib/catalog-state";
import { useRosita } from "./use-rosita";
export function useCatalog() {
  const { state } = useRosita();
  return useMemo(() => currentProducts(state), [state]);
}
