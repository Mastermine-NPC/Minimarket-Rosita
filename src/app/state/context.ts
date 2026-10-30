import { createContext, type Dispatch } from "react";
import type { RositaAction, RositaState } from "@/types/state";
export interface RositaContextValue {
  state: RositaState;
  dispatch: Dispatch<RositaAction>;
  reset: () => void;
  initialNotice: string;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}
export const RositaContext = createContext<RositaContextValue | null>(null);
