import { z } from "zod";
import { validSubcategory } from "@/data/subcategories";
import { v4Schema } from "./legacy-v4-schema";
export { legacySchema, v2Schema } from "./legacy-v4-schema";

// V4 queda congelado para validar migraciones. V5 conserva sus comprobaciones
// y añade exclusivamente clasificación válida a los registros actuales.
const product = v4Schema.shape.products.element
  .extend({ subcategory: z.string().min(1) })
  .refine((p) => validSubcategory(p.category, p.subcategory), {
    path: ["subcategory"],
    message: "Subcategoría incompatible con la categoría del producto.",
  });
export const v5Schema = v4Schema.safeExtend({
  products: z.array(product).min(1).max(10000),
});
