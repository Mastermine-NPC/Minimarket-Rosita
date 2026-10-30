import { z } from "zod";

import { productImages } from "@/data/product-images";
export const productInputSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(
      /^[A-Z0-9][A-Z0-9_-]{2,39}$/,
      "Usa 3–40 letras mayúsculas, números, guiones o guion bajo.",
    ),
  name: z
    .string()
    .trim()
    .min(3, "Escribe un nombre de al menos 3 caracteres.")
    .max(100, "Usa hasta 100 caracteres."),
  brand: z.string().trim().min(2, "Indica la marca o Genérico.").max(60),
  category: z.string().min(1, "Selecciona una categoría."),
  subcategory: z.string().min(1, "Selecciona una subcategoría."),
  description: z
    .string()
    .trim()
    .min(10, "Describe el producto con al menos 10 caracteres.")
    .max(500, "Usa hasta 500 caracteres."),
  presentation: z
    .string()
    .trim()
    .min(2, "Indica la presentación o unidad.")
    .max(100),
  imageKey: z
    .string()
    .refine(
      (v) =>
        productImages.some((i) => i.key === v) ||
        /^upload:[a-f0-9-]{36}$/.test(v),
      "Selecciona una imagen válida.",
    ),
  active: z.boolean(),
  lowStockThreshold: z
    .number()
    .int("Usa un umbral entero.")
    .min(0)
    .max(1000000),
  priceCents: z
    .number()
    .int()
    .min(1, "El precio debe ser mayor que cero.")
    .max(100000000, "El precio máximo de prueba es S/ 1 000 000."),
  initialStock: z
    .number()
    .int("El stock debe ser entero.")
    .min(0, "El stock no puede ser negativo.")
    .max(1000000),
});
export const isValidAt = (value: string) =>
  z.iso.datetime().safeParse(value).success;
