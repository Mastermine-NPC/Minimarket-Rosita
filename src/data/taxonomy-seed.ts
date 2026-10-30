import { categories } from "./catalog";
import { subcategories } from "./subcategories";
export const seedCategories = categories.map((c, i) => ({
  ...c,
  slug: c.id,
  aliases: [] as string[],
  active: true,
  order: i,
  imageKey: "none",
}));
export const seedSubcategories = subcategories.map((s, i) => ({
  ...s,
  slug: s.id,
  aliases: [] as string[],
  description: "Productos de " + s.name.toLocaleLowerCase("es") + ".",
  active: true,
  order: i,
}));
