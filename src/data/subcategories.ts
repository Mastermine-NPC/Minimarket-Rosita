import type { CategoryId } from "@/types/catalog";
export interface Subcategory {
  id: string;
  category: CategoryId;
  name: string;
  pending?: boolean;
}
export const subcategories: readonly Subcategory[] = [
  { id: "bebidas", category: "consumibles", name: "Bebidas" },
  { id: "snacks", category: "consumibles", name: "Snacks" },
  { id: "galletas", category: "consumibles", name: "Galletas" },
  {
    id: "herramientas-manuales",
    category: "ferreteria",
    name: "Herramientas manuales",
  },
  {
    id: "herramientas-electricas",
    category: "ferreteria",
    name: "Herramientas eléctricas",
  },
  {
    id: "cables-adaptadores",
    category: "tecnologia",
    name: "Cables y adaptadores",
  },
  { id: "pilas", category: "tecnologia", name: "Pilas" },
  { id: "almacenamiento", category: "tecnologia", name: "Almacenamiento" },
  { id: "juegos-mesa", category: "jugueteria", name: "Juegos de mesa" },
  {
    id: "juegos-deportivos",
    category: "jugueteria",
    name: "Juegos deportivos",
  },
  { id: "geometria", category: "educacion-oficina", name: "Geometría" },
  {
    id: "cuadernos-papel",
    category: "educacion-oficina",
    name: "Cuadernos y papel",
  },
  { id: "organizacion", category: "educacion-oficina", name: "Organización" },
  {
    id: "accesorios-oficina",
    category: "educacion-oficina",
    name: "Accesorios de oficina",
  },
  { id: "higiene-bucal", category: "cuidado-personal", name: "Higiene bucal" },
  {
    id: "cuidado-capilar",
    category: "cuidado-personal",
    name: "Cuidado capilar",
  },
  { id: "jabones", category: "cuidado-personal", name: "Jabones" },
  ...(
    [
      "consumibles",
      "ferreteria",
      "tecnologia",
      "jugueteria",
      "educacion-oficina",
      "cuidado-personal",
    ] as const
  ).map((category) => ({
    id: category + "-por-clasificar",
    category,
    name: "Por clasificar",
    pending: true,
  })),
];
export const subcategoriesFor = (category: string) =>
  subcategories.filter((s) => s.category === category);
export const subcategoryById = (id: string) =>
  subcategories.find((s) => s.id === id);
export const validSubcategory = (category: string, id: string) =>
  subcategories.some((s) => s.category === category && s.id === id);
/** Migración conservadora: solo reconoce tipos explícitos en el nombre actual. */
export function inferSubcategory(product: {
  category: CategoryId;
  name: string;
}) {
  const name = product.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const rules: Record<CategoryId, readonly [RegExp, string][]> = {
    consumibles: [
      [/\b(gaseosa|bebida|agua mineral|agua embotellada|jugo)\b/, "bebidas"],
      [/\b(galleta|galletas)\b/, "galletas"],
      [/\b(papas|doritos|snack|snacks)\b/, "snacks"],
    ],
    ferreteria: [
      [
        /\b(taladro inalambrico|taladro electrico|atornillador electrico)\b/,
        "herramientas-electricas",
      ],
      [
        /\b(destornillador|destornilladores|juego de llaves y dados|llave de ajuste|cinta metrica)\b/,
        "herramientas-manuales",
      ],
    ],
    tecnologia: [
      [/\b(cable|adaptador)\b/, "cables-adaptadores"],
      [/\b(pilas|pila)\b/, "pilas"],
      [/\b(memoria usb|disco duro|tarjeta de memoria)\b/, "almacenamiento"],
    ],
    jugueteria: [
      [/\b(monopoly|ajedrez|jenga|juego de mesa)\b/, "juegos-mesa"],
      [/\b(pelota|balon)\b/, "juegos-deportivos"],
    ],
    "educacion-oficina": [
      [/\b(escuadras|compas|transportador)\b/, "geometria"],
      [/\b(cuaderno|cuadernos|papel)\b/, "cuadernos-papel"],
      [/\b(sobres|archivador|carpeta)\b/, "organizacion"],
      [/\b(perforador|engrapador)\b/, "accesorios-oficina"],
    ],
    "cuidado-personal": [
      [/\b(pasta dental|cepillo dental|enjuague bucal)\b/, "higiene-bucal"],
      [
        /\b(shampoo|champu|tratamiento nutribela|tratamiento capilar)\b/,
        "cuidado-capilar",
      ],
      [/\b(jabon|jabones)\b/, "jabones"],
    ],
  };
  return (
    rules[product.category]?.find(([pattern]) => pattern.test(name))?.[1] ||
    product.category + "-por-clasificar"
  );
}
