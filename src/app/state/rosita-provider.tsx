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
import type { RositaState } from "@/types/state";
import { RositaContext } from "./context";
import { rositaReducer } from "./reducer";
import {
  readRositaState,
  resetRositaStorage,
  writeRositaState,
} from "@/lib/storage";
export function RositaProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readRositaState);
  const [notice, setNotice] = useState(initial.notice);
  const [cartOpen, setCartOpen] = useState(false);
  const [state, dispatch] = useReducer(rositaReducer, initial.data);
  const last = useRef<RositaState | null>(
    ["migrated", "repaired"].includes(initial.status) ? null : initial.data,
  );
  const blocked = useRef(initial.status === "future");
  useEffect(() => {
    if (state === last.current || blocked.current) return;
    const result = writeRositaState(state);
    last.current = state;
    if (!result.ok) {
      queueMicrotask(() =>
        setNotice(result.message || "Sesión temporal sin almacenamiento."),
      );
      toast.error(result.message, { id: "rosita-storage-unavailable" });
    }
  }, [state]);
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
  }, [state]);
  const value = useMemo(
    () => ({
      state,
      dispatch,
      reset,
      initialNotice: notice,
      cartOpen,
      setCartOpen,
    }),
    [state, reset, notice, cartOpen],
  );
  return (
    <RositaContext.Provider value={value}>{children}</RositaContext.Provider>
  );
}
