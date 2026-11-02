import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Order, StatusEvent } from "@/types/commerce";
import { orderStatusMessage } from "@/lib/order-events";
import { stagesFor } from "@/data/delivery";
interface Preview { active: boolean; status: number; events: StatusEvent[]; runId: string }
const empty: Preview = { active: false, status: 0, events: [], runId: "" };
/** Uses the existing state names and transitions; it never dispatches a commerce action. */
export function useTrackingDemonstration(order: Order) {
  const [preview, setPreview] = useState<Preview>(empty), current = useRef(empty), timers = useRef<ReturnType<typeof setTimeout>[]>([]), notified = useRef(new Set<string>());
  const clear = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  const publish = useCallback((next: Preview, event?: StatusEvent) => {
    current.current = next; setPreview(next);
    if (event && !notified.current.has(event.id)) {
      notified.current.add(event.id);
      toast.info(`Demostración · ${stagesFor(order.delivery)[event.to]}`, { id: event.id, description: `Ejemplo: ${orderStatusMessage(order, event.to)}` });
    }
  }, [order]);
  const advance = useCallback((runId: string, to: number) => {
    const previous = current.current;
    if (!previous.active || previous.runId !== runId || to !== previous.status + 1 || to > 3) return;
    const event: StatusEvent = { id: `demo:${runId}:${to}`, from: previous.status, to, at: new Date().toISOString(), actorId: "local-preview", actorLabel: "Demostración local", origin: "client-demo" };
    publish({ ...previous, status: to, events: [...previous.events, event] }, event);
  }, [publish]);
  const enter = useCallback(() => {
    clear(); const runId = crypto.randomUUID(); notified.current.clear();
    const event: StatusEvent = { id: `demo:${runId}:0`, from: null, to: 0, at: new Date().toISOString(), actorId: "local-preview", actorLabel: "Demostración local", origin: "client-demo" };
    publish({ active: true, status: 0, events: [event], runId }, event);
    timers.current = [setTimeout(() => advance(runId, 1), 1200), setTimeout(() => advance(runId, 2), 2400)];
  }, [advance, clear, publish]);
  const leave = useCallback(() => { clear(); publish(empty); }, [clear, publish]);
  const deliver = useCallback(() => advance(current.current.runId, 3), [advance]);
  const rewind = useCallback(() => { const p = current.current; if (p.active && p.status === 3) publish({ ...p, status: 2, events: p.events.filter(e => e.to < 3) }); }, [publish]);
  useEffect(() => () => clear(), [clear]);
  return { ...preview, enter, leave, deliver, rewind };
}
