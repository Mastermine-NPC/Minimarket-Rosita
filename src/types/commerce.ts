export interface DemoUser {
  demoAccess?: boolean;
  role: "customer" | "admin" | "cashier";
  active?: boolean;
  cashierDemo?: boolean;
  id: string;
  name: string;
  email: string;
  salt: string;
  verifier: string;
  iterations: number;
  createdAt: string;
}
export interface InventoryEntry {
  stock: number;
  priceCents: number;
}
import type { GeoPoint, RoadRoute } from "./operations";
export interface Delivery {
  mode?: "delivery" | "pickup";
  origin?: GeoPoint;
  point?: GeoPoint;
  pointConfirmed?: boolean;
  route?: RoadRoute;
  recipient: string;
  phone: string;
  address: string;
  zone: string;
  reference: string;
}
export type PaymentMethod = "cash" | "yape-demo" | "plin-demo" | "card-demo";
export interface Payment {
  method: PaymentMethod;
  cashAmount: string;
}
export interface OrderLine {
  productId: string;
  name: string;
  presentation: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}
export interface Quote {
  fingerprint: string;
  lines: OrderLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  zoneLabel: string;
  estimate: string;
  cashTenderCents: number | null;
}
export interface StatusEvent {
  id: string;
  from: number | null;
  to: number;
  at: string;
  actorId: string;
  actorLabel: string;
  origin: "order-created" | "client-demo" | "admin-demo";
}
export interface StockMovement {
  id: string;
  operationId: string;
  productId: string;
  productName: string;
  kind: "entry" | "manual-out" | "count" | "order-out" | "sale-out";
  delta: number;
  before: number;
  after: number;
  reason: string;
  at: string;
  actorId: string;
  actorLabel: string;
  orderId: string | null;
  saleId?: string;
}
export interface CardReceipt {
  reference: string;
  brand: "Demo";
  last4: string;
}
export interface CardApproval extends CardReceipt {
  fingerprint: string;
  token: string;
  userId: string;
}
export interface Order extends Omit<Quote, "fingerprint"> {
  id: string;
  requestId: string;
  userId: string;
  createdAt: string;
  delivery: Delivery;
  payment: PaymentMethod;
  cardReceipt?: CardReceipt;
  status: number;
  statusHistory: StatusEvent[];
  legacyHistory: boolean;
  customerName: string | null;
  customerEmail: string | null;
}
export interface CheckoutDraft {
  token: string;
  step: number;
  delivery: Delivery;
  payment: Payment;
  quote: Quote | null;
  error: string;
}
