import { useContext } from "react";
import { RositaContext } from "@/app/state/context";
export function useRosita() {
  const value = useContext(RositaContext);
  if (!value) throw new Error("useRosita requiere RositaProvider");
  return value;
}
