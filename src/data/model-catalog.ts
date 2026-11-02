/** Prototype defaults only. Prices (cents) and opening stock remain editable in administration. */
export const modelCatalogRevision = "rosita-normal-catalog-v2";
export const modelDemoDefaults = {
  cocaColaCan: { priceCents: 450, stock: 12 },
  nivea: { priceCents: 2490, stock: 8 },
  sunsilk: { priceCents: 1290, stock: 10 },
  lays: { priceCents: 400, stock: 12 },
};
/** Slugs correspond to the named authored meshes, not inferred or invented flavours. */
export const laysFlavours = [
  { slug: "classic", name: "Classic", mesh: 0 },
  { slug: "sweet-bbq", name: "Sweet BBQ", mesh: 1 },
  { slug: "cheddar", name: "Cheddar", mesh: 2 },
  { slug: "chile-limon", name: "Chile Limón", mesh: 3 },
  { slug: "flaming-hot", name: "Flaming Hot", mesh: 4 },
  { slug: "honey-bbq", name: "Honey BBQ", mesh: 5 },
  { slug: "classic-less-salt", name: "Classic Less Salt", mesh: 6 },
  { slug: "dill-pickle", name: "Dill Pickle", mesh: 7 },
  { slug: "ranch-wavy", name: "Ranch Wavy", mesh: 8 },
  { slug: "bbq-wavy", name: "BBQ Wavy", mesh: 9 },
] as const;
export const modelCatalogProducts = [
  { id: "ROS-064", featured: true, modelKey: "coca-cola-can", name: "Coca-Cola en lata", brand: "Coca-Cola", category: "consumibles", subcategory: "bebidas", presentation: "Lata · unidad", ...modelDemoDefaults.cocaColaCan },
  { id: "ROS-065", featured: true, modelKey: "nivea-aftershave", name: "Nivea Aftershave", brand: "Nivea", category: "cuidado-personal", subcategory: "cuidado-facial", presentation: "Frasco · unidad", ...modelDemoDefaults.nivea },
  { id: "ROS-066", featured: true, modelKey: "sunsilk-shampoo", name: "Champú Sunsilk", brand: "Sunsilk", category: "cuidado-personal", subcategory: "cuidado-capilar", presentation: "Botella · unidad", ...modelDemoDefaults.sunsilk },
  ...laysFlavours.filter(flavour => flavour.slug !== "classic").map((flavour, index) => ({
    id: "ROS-" + String(67 + index).padStart(3, "0"), featured: false, modelKey: "lays-" + flavour.slug,
    name: "Papas Lay’s " + flavour.name, brand: "Lay’s", category: "consumibles", subcategory: "snacks", presentation: "Bolsa · unidad", ...modelDemoDefaults.lays,
  })),
].map(product => ({ ...product, imageSrc: `/images/productos/modelos/${product.modelKey}.png` }));
