import type { RositaState } from "@/types/state";
import { storeOrigin } from "@/data/geography";
import { withDemoCashier } from "@/data/cashier-seed";
export function demoBarcode(n: number) {
  const body = String(n).padStart(12, "0");
  const sum = [...body].reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
  return body + ((10 - (sum % 10)) % 10);
}
export function initializeOperations(
  state: Omit<
    RositaState,
    "storeLocation" | "cashDrafts" | "sales" | "shifts" | "tracking"
  > &
    Partial<
      Pick<
        RositaState,
        "storeLocation" | "cashDrafts" | "sales" | "shifts" | "tracking"
      >
    >,
): RositaState {
  const used = new Set(state.products.map((p) => p.barcode).filter(Boolean));
  let fallback = 1000;
  return {
    ...state,
    operationsRevision: "rosita-operations-v1",
    storeLocation: state.storeLocation || storeOrigin,
    cashDrafts: state.cashDrafts || {},
    sales: state.sales || [],
    shifts: state.shifts || [],
    tracking: state.tracking || {},
    users: withDemoCashier(state.users),
    products: state.products.map((p) => {
      if (p.barcode) return p;
      let n = Number((p.code || p.id).match(/^ROS-(\d+)$/)?.[1]) || fallback++;
      while (used.has(demoBarcode(n))) n = fallback++;
      const barcode = demoBarcode(n);
      used.add(barcode);
      return { ...p, barcode };
    }),
    checkout: {
      ...state.checkout,
      quote: null,
      delivery: {
        ...state.checkout.delivery,
        mode: state.checkout.delivery.mode || "delivery",
      },
    },
  };
}
