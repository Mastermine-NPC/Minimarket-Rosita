import { priceCart } from "@/lib/cart-pricing";
import { useCatalog } from "@/hooks/use-catalog";
import { useMemo } from "react";
import { toast } from "sonner";
import { useRosita } from "./use-rosita";

import type { Product } from "@/types/catalog";
export function useCart() {
  const products = useCatalog();
  const { state, dispatch, setCartOpen } = useRosita();
  const pricing = useMemo(() => priceCart(state), [state]);
  const lines = useMemo(
    () =>
      pricing.lines.map((line) => ({
        product: products.find((p) => p.id === line.productId)!,
        quantity: line.quantity,
        lineTotal: line.lineTotalCents / 100,
      })),
    [pricing, products],
  );
  const count = pricing.count,
    subtotal = pricing.subtotalCents / 100;
  function add(product: Product, quantity = 1) {
    if (product.active === false) {
      toast.error("Este producto está desactivado.");
      return;
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    if ((state.cart[product.id] || 0) >= product.stock) {
      toast.info("Ya tienes todo el stock disponible en tu carrito.");
      return;
    }
    dispatch({ type: "cart/add", id: product.id, quantity });
    toast.success("Agregado al carrito", {
      id: "cart-" + product.id,
      description: product.name,
      action: { label: "Ver carrito", onClick: () => setCartOpen(true) },
    });
  }
  function remove(id: string) {
    dispatch({ type: "cart/remove", id });
    toast.info("Producto eliminado del carrito.");
  }
  return {
    lines,
    count,
    subtotal,
    error: pricing.error,
    cart: state.cart,
    add,
    remove,
    set: (id: string, quantity: number) =>
      dispatch({ type: "cart/set", id, quantity }),
    clear: () => dispatch({ type: "cart/clear" }),
    open: () => setCartOpen(true),
  };
}
