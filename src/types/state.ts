import type {
  ManagedCategory,
  ManagedSubcategory,
  ImageAsset,
  ModuleAction,
} from "./modules";
import type { Cart, CatalogRecord, ProductInput } from "./catalog";
import type {
  CardApproval,
  DemoUser,
  InventoryEntry,
  CheckoutDraft,
  Delivery,
  Payment,
  Order,
  StockMovement,
} from "./commerce";
import type { OperationsState, OperationsAction } from "./operations";
export interface RositaState extends OperationsState {
  halloweenRevision?: string;
  catalogRevision?: string;
  modelCatalogRevision?: string;
  categories: ManagedCategory[];
  subcategories: ManagedSubcategory[];
  media: Record<string, ImageAsset>;
  products: CatalogRecord[];
  movements: StockMovement[];
  recordingSince: string;
  processedAdminOperations: string[];
  adminResult: { operationId: string; ok: boolean; error: string };
  demoQuantity: number;
  cart: Cart;
  users: DemoUser[];
  sessionUserId: string | null;
  inventory: Record<string, InventoryEntry>;
  orders: Order[];
  checkout: CheckoutDraft;
  authError: string;
}
export type RositaAction =
  | OperationsAction
  | ModuleAction
  | { type: "demo/increment" }
  | { type: "demo/decrement" }
  | { type: "app/reset"; at?: string }
  | { type: "cart/add" | "cart/set"; id: string; quantity: number }
  | { type: "cart/remove"; id: string }
  | { type: "cart/clear" }
  | { type: "auth/register"; user: Omit<DemoUser, "role"> }
  | { type: "auth/login"; userId: string }
  | { type: "auth/logout" }
  | {
      type: "admin/product-archive";
      id: string;
      archived: boolean;
      operationId: string;
      at: string;
    }
  | { type: "checkout/start"; token: string }
  | { type: "checkout/draft-delivery"; delivery: Delivery }
  | { type: "checkout/delivery"; delivery: Delivery }
  | { type: "checkout/draft-payment"; payment: Payment }
  | { type: "checkout/payment"; payment: Payment }
  | { type: "checkout/step"; step: number }
  | { type: "checkout/review" }
  | {
      type: "order/confirm";
      token: string;
      id: string;
      createdAt: string;
      cardApproval?: CardApproval | null;
    }
  | {
      type: "order/advance";
      id: string;
      expectedStatus: number;
      operationId: string;
      at: string;
    }
  | {
      type: "admin/product-save";
      operationId: string;
      at: string;
      input: ProductInput;
      editing: boolean;
      expectedUpdatedAt: string | null;
    }
  | {
      type: "admin/product-active";
      operationId: string;
      at: string;
      id: string;
      active: boolean;
      expectedUpdatedAt: string | null;
    }
  | {
      type: "admin/stock";
      operationId: string;
      at: string;
      id: string;
      kind: "entry" | "manual-out" | "count";
      quantity: number;
      reason: string;
      expectedStock: number;
    };
