import { useRosita } from "./use-rosita";
import { categoryPath } from "@/lib/taxonomy";
import { useMemo } from "react";
export function useTaxonomy() {
  const { state } = useRosita();
  const categories = useMemo(() => [...state.categories].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name, "es"),
  ), [state.categories]);
  const subcategories = useMemo(() => [...state.subcategories].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name, "es"),
  ), [state.subcategories]);
  const categoryById = (id: string) =>
    categories.find(
      (c) => c.id === id || c.slug === id || c.aliases.includes(id),
    );
  const subcategoryById = (id: string) =>
    subcategories.find(
      (s) => s.id === id || s.slug === id || s.aliases.includes(id),
    );
  return {
    categories,
    activeCategories: categories.filter((c) => c.active),
    subcategories,
    categoryById,
    subcategoryById,
    categoryPath,
    subcategoriesFor: (category: string) =>
      subcategories.filter((s) => s.category === category),
    validSubcategory: (category: string, id: string) =>
      !!subcategoryById(id) && subcategoryById(id)?.category === category,
  };
}
