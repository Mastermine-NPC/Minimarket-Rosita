import { useRef } from "react";
import { useLocation } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useRosita } from "@/hooks/use-rosita";
import { CartContent } from "./cart-content";
export function CartSheet() {
  const { cartOpen, setCartOpen } = useRosita();
  const origin = useRef<HTMLElement | null>(null);
  const originPath = useRef("");
  const location = useLocation();
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        className="cart-sheet"
        onOpenAutoFocus={() => {
          origin.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          originPath.current = location.pathname;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (originPath.current !== location.pathname) {
            document.querySelector<HTMLElement>("main h1")?.focus();
            return;
          }
          const target =
            origin.current?.isConnected &&
            origin.current.matches(
              "button, a[href], input, select, textarea, [tabindex]",
            )
              ? origin.current
              : document.querySelector<HTMLElement>(
                  'button[aria-label^="Abrir carrito,"]',
                );
          target?.focus();
        }}
      >
        <SheetHeader>
          <span className="eyebrow">TU SELECCIÓN</span>
          <SheetTitle>Tu carrito</SheetTitle>
          <SheetDescription>
            Lo que necesitas, en un solo lugar. Datos de prueba.
          </SheetDescription>
        </SheetHeader>
        <div className="cart-sheet-scroll">
          <CartContent panel />
        </div>
      </SheetContent>
    </Sheet>
  );
}
