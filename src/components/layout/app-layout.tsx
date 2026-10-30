import { useLocation } from "react-router";
import { useStoreScroll } from "@/hooks/use-store-scroll";
import { Outlet } from "react-router";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRosita } from "@/hooks/use-rosita";
import { StoreHeader } from "./store-header";
import { StoreFooter } from "./store-footer";
import { CartSheet } from "@/features/carrito/cart-sheet";
export function AppLayout() {
  const { initialNotice } = useRosita();
  const location = useLocation();
  useStoreScroll();
  return (
    <div
      className={
        location.pathname === "/"
          ? "store-shell home-store-shell"
          : "store-shell"
      }
    >
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <StoreHeader />
      <main id="contenido" tabIndex={-1}>
        {initialNotice && (
          <div className="container storage-notice">
            <Alert>
              <AlertTitle>Información de almacenamiento</AlertTitle>
              <AlertDescription>{initialNotice}</AlertDescription>
            </Alert>
          </div>
        )}
        <Outlet />
      </main>
      <StoreFooter />
      <CartSheet />
    </div>
  );
}
