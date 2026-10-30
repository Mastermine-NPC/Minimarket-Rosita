import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRosita } from "./use-rosita";
import type { RositaAction } from "@/types/state";
type Command = Extract<
  RositaAction,
  { type: `admin/${string}` | "order/advance" | "profile/save" }
>;
export function useOperation(onSuccess: () => void, message: string) {
  const { state, dispatch } = useRosita(),
    [id, setId] = useState(""),
    lock = useRef(false),
    handled = useRef("");
  useEffect(() => {
    if (!id || state.adminResult.operationId !== id || handled.current === id)
      return;
    handled.current = id;
    lock.current = false;
    if (state.adminResult.ok) {
      toast.success(message);
      onSuccess();
    } else toast.error(state.adminResult.error);
  }, [id, state.adminResult, message, onSuccess]);
  function run(build: (id: string, at: string) => Command) {
    if (lock.current) return;
    lock.current = true;
    const id = crypto.randomUUID();
    setId(id);
    dispatch(build(id, new Date().toISOString()));
  }
  return {
    run,
    error:
      state.adminResult.operationId === id && !state.adminResult.ok
        ? state.adminResult.error
        : "",
    pending: !!id && state.adminResult.operationId !== id,
  };
}
