import type { Order, StatusEvent } from "@/types/commerce";
import type { RositaState } from "@/types/state";
import { stagesFor } from "@/data/delivery";
export function orderStatusMessage(order: Pick<Order, "delivery">, status: number) {
  const pickup = order.delivery.mode === "pickup";
  return ["¡Hemos recibido tu pedido!", "Estamos preparando tus productos.", pickup ? "Tu pedido está listo para recoger." : "¡Tu pedido está en camino!", pickup ? "Tu pedido ha sido recogido." : "Tu pedido ha sido entregado."][status] || "El estado de tu pedido cambió.";
}
export interface OrderNotification { id: string; orderId: string; event: StatusEvent; title: string; message: string }
/** The persisted order history is also the notification history: never a second event store. */
export function orderNotifications(orders: Order[], userId: string): OrderNotification[] {
  const unique = new Map<string, OrderNotification>();
  for (const order of orders) if (order.userId === userId) {
    for (const event of order.statusHistory) {
      const id = `${order.id}:${event.id}`;
      unique.set(id, { id, orderId: order.id, event, title: stagesFor(order.delivery)[event.to], message: orderStatusMessage(order, event.to) });
    }
  }
  return [...unique.values()].sort((a, b) => b.event.at.localeCompare(a.event.at) || a.id.localeCompare(b.id));
}
const canonical = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  return value;
};
const same = (a: unknown, b: unknown) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
/** Only forward, administrator-recorded extensions of known immutable orders are accepted. */
export function receiveOrderUpdates(state: RositaState, incoming: Order[]): RositaState {
  let changed = false;
  const ids = new Set(state.processedAdminOperations);
  const orders = state.orders.map(order => {
    const remote = incoming.find(o => o.id === order.id);
    if (!remote || remote.status <= order.status) return order;
    const immutable = ({ status: _status, statusHistory: _history, ...snapshot }: Order) => { void _status; void _history; return snapshot; };
    if (!same(immutable(order), immutable(remote))) return order;
    if (remote.statusHistory.length !== order.statusHistory.length + remote.status - order.status) return order;
    if (!same(remote.statusHistory.slice(0, order.statusHistory.length), order.statusHistory)) return order;
    const added = remote.statusHistory.slice(order.statusHistory.length);
    if (!added.every((event, i) => event.from === order.status + i && event.to === order.status + i + 1 && event.to <= 3 && event.origin === "admin-demo" && !ids.has(event.id) && state.users.some(u => u.id === event.actorId && u.role === "admin" && u.active !== false))) return order;
    for (const event of added) ids.add(event.id);
    changed = true;
    return { ...order, status: remote.status, statusHistory: remote.statusHistory };
  });
  return changed ? { ...state, orders, processedAdminOperations: [...ids] } : state;
}
