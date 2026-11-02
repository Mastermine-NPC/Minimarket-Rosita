import { Check } from "lucide-react";
import type { Order } from "@/types/commerce";
import { stagesFor } from "@/data/delivery";
import { orderDate } from "@/lib/order-date";
export function OrderTimeline({ order }: { order: Order }) {
  return <ol className="tracking-steps order-state-timeline" aria-label="Etapas guardadas del pedido">{stagesFor(order.delivery).map((stage, index) => {
    const recorded = order.statusHistory.filter(e => e.to === index).at(-1);
    const state = index < order.status ? "complete" : index === order.status ? "current" : "pending";
    return <li key={stage} className={state} aria-current={state === "current" ? "step" : undefined}><span aria-hidden="true">{state === "complete" ? <Check size={16} /> : index + 1}</span><div><strong>{stage}</strong><small>{state === "current" ? "Estado actual" : state === "complete" ? "Completado" : "Pendiente"}</small>{index <= order.status && (recorded ? <time dateTime={recorded.at}>{orderDate(recorded.at)}</time> : <small>Sin fecha registrada</small>)}</div></li>;
  })}</ol>;
}
