import type { Cart } from "./catalog";
import type {
  OrderLine,
  CardApproval,
  CardReceipt,
  DemoUser,
} from "./commerce";
export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
  source: string;
}
export interface RoadRoute {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  provider: string;
  fetchedAt: string;
  origin: GeoPoint;
  destination: GeoPoint;
  start: [number, number];
  end: [number, number];
  fallback?: boolean;
}
export interface CashDraft {
  token: string;
  revision: number;
  cart: Cart;
}
export interface SaleLine extends OrderLine {
  code: string;
  barcode: string;
}
export interface Sale {
  id: string;
  requestId: string;
  agentId: string;
  agentName: string;
  shiftId: string;
  createdAt: string;
  lines: SaleLine[];
  totalCents: number;
  payment: "cash" | "card-demo";
  cashTenderCents: number | null;
  changeCents: number;
  cardReceipt?: CardReceipt;
}
export interface CashShift {
  id: string;
  agentId: string;
  agentName: string;
  openedAt: string;
  initialCents: number;
  closedAt: string | null;
  countedCents: number | null;
  expectedCents: number | null;
  differenceCents: number | null;
}
export interface OperationsState {
  operationsRevision?: string;
  storeLocation: GeoPoint;
  cashDrafts: Record<string, CashDraft>;
  sales: Sale[];
  shifts: CashShift[];
  tracking: Record<string, { progress: number; speed: number }>;
}
type Stamp = { operationId: string; at: string };
export type OperationsAction =
  | ({
      type: "agent/save";
      id: string;
      name: string;
      email: string;
      active: boolean;
      credentials?: Pick<DemoUser, "salt" | "verifier" | "iterations">;
    } & Stamp)
  | ({ type: "store/location"; point: GeoPoint } & Stamp)
  | ({ type: "shift/open"; id: string; initialCents: number } & Stamp)
  | ({ type: "shift/close"; id: string; countedCents: number } & Stamp)
  | {
      type: "cash/cart";
      operationId?: string;
      kind: "add" | "set" | "remove" | "clear";
      id: string;
      quantity: number;
      token: string;
    }
  | ({
      type: "cash/confirm";
      id: string;
      token: string;
      fingerprint: string;
      payment: "cash" | "card-demo";
      cashTenderCents: number | null;
      cardApproval?: CardApproval | null;
    } & Stamp)
  | { type: "tracking/save"; id: string; progress: number; speed: number };
