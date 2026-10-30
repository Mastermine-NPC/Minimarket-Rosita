export type CategoryId = string;
export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  imageProductId: string;
  tone: string;
}
export interface Product {
  barcode?: string;
  code?: string;
  archived?: boolean;
  imageNote?: string;
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  subcategory: string;
  presentation: string;
  description: string;
  price: number;
  previousPrice?: number;
  stock: number;
  imageIndex?: number;
  featured?: boolean;
  active?: boolean;
  lowStockThreshold?: number;
  imageSrc?: string;
  imageAssetId?: string;
  imageIsIllustration?: boolean;
}
export type Cart = Record<string, number>;

export interface CatalogRecord {
  barcode?: string;
  code?: string;
  archived?: boolean;
  imageNote?: string;
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  subcategory: string;
  presentation: string;
  description: string;
  imageKey: string;
  active: boolean;
  lowStockThreshold: number;
  previousPrice?: number;
  featured?: boolean;
  origin: "seed" | "demo";
  createdAt: string | null;
  updatedAt: string | null;
}
export interface ProductInput {
  barcode?: string;
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  subcategory: string;
  presentation: string;
  description: string;
  imageKey: string;
  active: boolean;
  lowStockThreshold: number;
  priceCents: number;
  initialStock: number;
}
