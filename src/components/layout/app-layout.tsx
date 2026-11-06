
import { useSmoothScroll } from "@/features/cinema/use-smooth-scroll";
import { PublicScene } from "@/features/cinema/public-scene";
import { usePublicMotion } from "@/features/cinema/use-public-motion";
import "@/styles/cinema-global.css";
import "@/styles/rosita-editorial.css";
import "@/styles/halloween-navigation.css";
import { EditorialAtmosphere } from "@/features/cinema/editorial-atmosphere";
import { useLocation } from "react-router";
import { useStoreScroll } from "@/hooks/use-store-scroll";
import { Outlet } from "react-router";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRosita } from "@/hooks/use-rosita";
import { StoreHeader } from "./store-header";
import { StoreFooter } from "./store-footer";
import { CartSheet } from "@/features/carrito/cart-sheet";
import "@/styles/product-screen-background.css";
export function AppLayout() {
  const { initialNotice } = useRosita();
  const location = useLocation();
  const authScreen = /^\/(login|registro|personal)\/?$/.test(location.pathname);
  const productBackground = location.pathname === "/" || /^\/(catalogo|categoria|producto|carrito|checkout)(\/|$)/.test(location.pathname);
  useStoreScroll();
  useSmoothScroll(location.pathname);
  usePublicMotion(location.pathname);
  return (
    <div
      className={
        location.pathname === "/"
          ? "store-shell home-store-shell product-background-shell"
          : "store-shell" + (authScreen ? " auth-store-shell" : "") + (productBackground ? " product-background-shell" : "")
      }
    >
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <EditorialAtmosphere background={!authScreen && location.pathname !== "/" && !productBackground} />
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
        <div className="public-route-content" data-route-path={location.pathname} key={/^\/(catalogo|categoria)(\/|$)/.test(location.pathname) ? "catalog" : authScreen ? "auth" : location.pathname}>
          <PublicScene pathname={location.pathname} />
          <div className="public-page-body"><Outlet /></div>
        </div>
      </main>
      <StoreFooter />
      <CartSheet />
    </div>
  );
}
