import { useMemo } from "react";
import { currentProducts } from "@/lib/catalog-state";
import { useRosita } from "./use-rosita";
export function useCatalog() {
  const { state } = useRosita();
  const { products, inventory, categories, subcategories } = state;
  return useMemo(() => currentProducts({ products, inventory, categories, subcategories }), [products, inventory, categories, subcategories]);
}
