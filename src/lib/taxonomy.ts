import type { RositaState } from "@/types/state";
export const categoryPath = (category: { slug?: string; id: string }) =>
  "/categoria/" + (category.slug || category.id);
export function taxonomyEnabled(
  state: Pick<RositaState, "categories" | "subcategories">,
  product: { category: string; subcategory: string },
) {
  return (
    !!state.categories.find((c) => c.id === product.category)?.active &&
    !!state.subcategories.find(
      (s) => s.id === product.subcategory && s.category === product.category,
    )?.active
  );
}
export const taxonomyPair = (
  state: Pick<RositaState, "categories" | "subcategories">,
  category: string,
  subcategory: string,
) =>
  state.categories.some((c) => c.id === category) &&
  state.subcategories.some(
    (s) => s.id === subcategory && s.category === category,
  );
