import { createContext, useContext } from "react";
import type { OrderNotification } from "@/lib/order-events";
export interface OrderNoticesValue {
  notifications: OrderNotification[]; unread: number; read: string[]; browserEnabled: boolean; permission: NotificationPermission | "unsupported";
  markRead: (id: string) => void; markAllRead: () => void; enableBrowser: () => Promise<void>; disableBrowser: () => void;
}
export const OrderNoticesContext = createContext<OrderNoticesValue | null>(null);
export function useOrderNotices() {
  const value = useContext(OrderNoticesContext);
  if (!value) throw new Error("Order notifications provider is missing");
  return value;
}
