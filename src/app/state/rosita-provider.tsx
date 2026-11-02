import { clearImages } from "@/lib/image-store";
import { isAdmin } from "@/lib/admin-operations";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { RositaAction, RositaState } from "@/types/state";
import { RositaContext } from "./context";
import { rositaReducer } from "./reducer";
import { receiveOrderUpdates } from "@/lib/order-events";
import { stateSchema } from "@/lib/state-schema";
import { STATE_KEY, STORAGE_VERSION } from "@/lib/storage";
import type { Order } from "@/types/commerce";
import {
  readRositaState,
  resetRositaStorage,
  writeRositaState,
} from "@/lib/storage";
type StoreSnapshot = { data: RositaState; localRevision: number };
type StoreMessage = { type: "local"; action: RositaAction } | { type: "remote"; orders: Order[] };
function updateStore(snapshot: StoreSnapshot, message: StoreMessage): StoreSnapshot {
  const data = message.type === "remote" ? receiveOrderUpdates(snapshot.data, message.orders) : rositaReducer(snapshot.data, message.action);
  return data === snapshot.data ? snapshot : { data, localRevision: snapshot.localRevision + Number(message.type === "local") };
}
export function RositaProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    const stored = readRositaState();
    try {
      const raw = sessionStorage.getItem("minimarket-rosita:tab-session");
      if (raw !== null) {
        const id: unknown = JSON.parse(raw);
        const sessionUserId = typeof id === "string" && stored.data.users.some(u => u.id === id && u.active !== false) ? id : null;
        return { ...stored, data: { ...stored.data, sessionUserId } };
      }
    } catch { /* The shared legacy session remains available if session storage is blocked. */ }
    return stored;
  });
  const [notice, setNotice] = useState(initial.notice);
  const [cartOpen, setCartOpen] = useState(false);
  const [snapshot, send] = useReducer(updateStore, { data: initial.data, localRevision: 0 });
  const state = snapshot.data;
  const dispatch = useCallback((action: RositaAction) => send({ type: "local", action }), []);
  const last = useRef<RositaState | null>(
    ["migrated", "repaired"].includes(initial.status) ? null : initial.data,
  );
  const blocked = useRef(initial.status === "future");
  const savedRevision = useRef(["migrated", "repaired"].includes(initial.status) ? -1 : 0);
  useEffect(() => {
    if (state === last.current || blocked.current) return;
    if (savedRevision.current === snapshot.localRevision) { last.current = state; return; }
    savedRevision.current = snapshot.localRevision;
    const result = writeRositaState(state);
    last.current = state;
    if (!result.ok) {
      queueMicrotask(() =>
        setNotice(result.message || "Sesión temporal sin almacenamiento."),
      );
      toast.error(result.message, { id: "rosita-storage-unavailable" });
    }
  }, [state, snapshot.localRevision]);
  useEffect(() => {
    try { sessionStorage.setItem("minimarket-rosita:tab-session", JSON.stringify(state.sessionUserId)); } catch { /* Session remains available in memory. */ }
  }, [state.sessionUserId]);
  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== STATE_KEY || !event.newValue) return;
      try {
        const envelope = JSON.parse(event.newValue);
        if (envelope.version !== STORAGE_VERSION) return;
        const parsed = stateSchema.safeParse(envelope.data);
        if (parsed.success) send({ type: "remote", orders: parsed.data.orders });
      } catch { /* Invalid or incompatible external state never replaces local orders. */ }
    };
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, []);
  const reset = useCallback(async () => {
    if (!isAdmin(state)) {
      toast.error("Identifícate como administrador para restablecer Rosita.");
      return;
    }
    const result = resetRositaStorage();
    if (!result.ok) {
      toast.error(result.message);
    }
    if (result.ok) {
      try {
        await clearImages();
      } catch {
        toast.error(
          "La sesión se restableció, pero quedaron imágenes locales sin borrar. Reintenta el restablecimiento.",
        );
      }
    }
    setNotice(result.ok ? "" : result.message || "Sesión temporal");
    if (result.ok) blocked.current = false;
    dispatch({ type: "app/reset", at: new Date().toISOString() });
    toast[result.ok ? "success" : "info"](
      result.ok
        ? "Datos de Rosita restablecidos"
        : "Sesión temporal restablecida",
      {
        description: result.ok
          ? "Las claves de otras aplicaciones se conservaron."
          : "El navegador sigue bloqueando el almacenamiento; los cambios no se guardarán.",
      },
    );
  }, [state, dispatch]);
  const value = useMemo(
    () => ({
      state,
      dispatch,
      reset,
      initialNotice: notice,
      cartOpen,
      setCartOpen,
    }),
    [state, dispatch, reset, notice, cartOpen],
  );
  return (
    <RositaContext.Provider value={value}>{children}</RositaContext.Provider>
  );
}
