import { taxonomyEnabled } from "./taxonomy";
import { productImages } from "@/data/product-images";
import type { RositaState } from "@/types/state";
import type { Product } from "@/types/catalog";
export function currentProducts(
  state: Pick<
    RositaState,
    "products" | "inventory" | "categories" | "subcategories"
  >,
): Product[] {
  return state.products.map((p) => {
    const inventory = state.inventory[p.id],
      image = productImages.find((i) => i.key === p.imageKey);
    return {
      ...p,
      active: p.active && taxonomyEnabled(state, p),
      imageAssetId: p.imageKey.startsWith("upload:")
        ? p.imageKey.slice(7)
        : undefined,
      stock: inventory.stock,
      price: inventory.priceCents / 100,
      previousPrice:
        p.previousPrice && p.previousPrice > inventory.priceCents / 100
          ? p.previousPrice
          : undefined,
      imageIndex: image?.index,
      imageSrc: image?.src || undefined,
      imageIsIllustration: image?.illustration,
    };
  });
}
