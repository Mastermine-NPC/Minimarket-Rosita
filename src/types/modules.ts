import type { Category } from "./catalog";
import type { Subcategory } from "@/data/subcategories";
export interface ManagedCategory extends Category {
  slug: string;
  aliases: string[];
  active: boolean;
  order: number;
  imageKey: string;
}
export interface ManagedSubcategory extends Subcategory {
  slug: string;
  aliases: string[];
  description: string;
  active: boolean;
  order: number;
}
export interface ImageAsset {
  id: string;
  width: number;
  height: number;
  bytes: number;
  mime: string;
  createdAt: string;
}
export interface TaxonomyInput {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  order: number;
  imageKey: string;
  category: string;
}
export type ModuleAction =
  | {
      type: "admin/taxonomy-save";
      kind: "category" | "subcategory";
      input: TaxonomyInput;
      editing: boolean;
      operationId: string;
      at: string;
    }
  | {
      type: "admin/media-register";
      asset: ImageAsset;
      operationId: string;
      at: string;
    }
  | {
      type: "profile/save";
      id: string;
      name: string;
      email: string;
      operationId: string;
      at: string;
    };
