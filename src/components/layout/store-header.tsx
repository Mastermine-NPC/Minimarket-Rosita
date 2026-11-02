import { useNavigationKey } from "@/hooks/use-navigation-key";
import { useHeaderClearance } from "./use-header-clearance";
import { useSmartHeader } from "./use-smart-header";
import { HelpMenuLinks } from "@/features/informacion/help-links";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useRosita } from "@/hooks/use-rosita";
import { useNavigate } from "react-router";
import { Package, LogOut } from "lucide-react";
import { motionTokens } from "@/lib/motion";
import { motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { useCallback, useState, useRef } from "react";
import { Link, NavLink } from "react-router";
import { ShoppingBag, UserRound, Menu, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetHeader,
} from "@/components/ui/sheet";

import { useCart } from "@/hooks/use-cart";
import { StoreSearch } from "./store-search";
export function StoreHeader() {
  const { activeCategories: categories, categoryPath } = useTaxonomy();
  const menuTrigger = useRef<HTMLButtonElement>(null),
    menuOrigin = useRef("");
  const reduced = useMotionPreference();
  const { count, open } = useCart();
  const navigate = useNavigate();
  const navigationKey = useNavigationKey();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menu = menuFor === navigationKey;
  const MenuOpen = (value: boolean) => setMenuFor(value ? navigationKey : null);
  const dismissMenu = useCallback(() => setMenuFor(null), []);
  const { state, dispatch, cartOpen } = useRosita();
  const { rootRef, open: headerOpen, hold, hide, toggle, close } = useSmartHeader(menu || cartOpen, dismissMenu);
  useHeaderClearance(rootRef, headerOpen);
  const user = state.users.find((u) => u.id === state.sessionUserId);
  return (
    <div ref={rootRef} className={"smart-navigation" + (headerOpen ? " is-open" : "")} onPointerEnter={hold} onPointerLeave={event => { if (event.pointerType === "mouse") hide(); }} onFocusCapture={hold} onBlurCapture={hide} onKeyDown={e => { if (e.key === "Escape") { close(); rootRef.current?.querySelector<HTMLButtonElement>(".navigation-discover")?.focus({ preventScroll: true }); } }}>
      <button className="navigation-discover" aria-label={headerOpen ? "Cerrar navegación de tienda" : "Abrir navegación de tienda"} aria-expanded={headerOpen} aria-controls="store-navigation-panel" onClick={toggle}><span className="navigation-indicator" aria-hidden="true" /></button>
      <div id="store-navigation-panel" className="smart-navigation-panel" inert={!headerOpen}>
      <div className="store-topbar">
        <div>
          <span>Tu minimarket de siempre, más cerca.</span>
          <span>Prototipo · Sin cobros</span>
        </div>
      </div>
      <header className="store-header">
        <div className="store-header-main">
          <Link
            className="store-brand"
            to="/"
            aria-label="Minimarket Rosita, inicio"
          >
            <img
              src="/images/rosita-logo.png"
              alt="Logotipo de Minimarket Rosita"
            />
            <span>
              <small>MINIMARKET</small>
              <strong>
                Rosita<span>.</span>
              </strong>
            </span>
          </Link>
          <StoreSearch />
          <div className="header-actions">
            <Button variant="ghost" className="account-trigger" asChild>
              <Link
                to={
                  user?.role === "cashier"
                    ? "/caja"
                    : user?.role === "admin"
                      ? "/admin"
                      : user
                        ? "/cuenta"
                        : "/login"
                }
                aria-label={
                  user
                    ? "Mi cuenta: " + user.name
                    : "Iniciar sesión de demostración"
                }
              >
                <UserRound size={22} aria-hidden="true" />
                <span>{user ? user.name.split(" ")[0] : "Mi cuenta"}</span>
              </Link>
            </Button>
            <Button variant="ghost" className="orders-trigger" asChild>
              <Link
                to={
                  user?.role === "cashier"
                    ? "/caja"
                    : user?.role === "admin"
                      ? "/admin/pedidos"
                      : "/mis-pedidos"
                }
                aria-label={
                  user?.role === "cashier"
                    ? "/caja"
                    : user?.role === "admin"
                      ? "Pedidos administrativos"
                      : "Mis pedidos"
                }
              >
                <Package size={22} aria-hidden="true" />
                <span>{user?.role === "cashier" ? "Caja" : "Pedidos"}</span>
              </Link>
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="logout-trigger"
                aria-label="Cerrar sesión"
                onClick={() => {
                  close(); dismissMenu();
                  dispatch({ type: "auth/logout" });
                  navigate("/login");
                }}
              >
                <LogOut size={18} aria-hidden="true" />
              </Button>
            )}
            <Button
              variant="ghost"
              className="cart-trigger"
              onClick={open}
              aria-label={
                "Abrir carrito, " +
                count +
                (count === 1 ? " unidad" : " unidades")
              }
            >
              <span className="cart-icon">
                <ShoppingBag size={23} aria-hidden="true" />
                <motion.span
                  key={count}
                  className="cart-count"
                  aria-live="polite"
                  aria-label={count + " unidades en carrito"}
                  initial={reduced ? false : { scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: reduced ? 0 : motionTokens.control,
                    ease: motionTokens.ease,
                  }}
                >
                  {count}
                </motion.span>
              </span>
              <span>Carrito</span>
            </Button>
          </div>
        </div>
        <div className="store-nav-wrap">
          <div className="store-navigation">
            <Sheet
              open={menu}
              onOpenChange={(value) => {
                if (value)
                  menuOrigin.current =
                    window.location.pathname + window.location.hash;
                MenuOpen(value);
              }}
            >
              <SheetTrigger asChild>
                <Button
                  ref={menuTrigger}
                  variant="ghost"
                  className="menu-trigger"
                >
                  <Menu size={18} aria-hidden="true" />
                  Menú
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="menu-sheet"
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  if (
                    headerOpen && menuOrigin.current ===
                    window.location.pathname + window.location.hash
                  )
                    menuTrigger.current?.focus({ preventScroll: true });
                  else
                    document
                      .querySelector<HTMLElement>("main h1")
                      ?.focus({ preventScroll: true });
                }}
              >
                <SheetHeader>
                  <SheetTitle>Rosita y ayuda</SheetTitle>
                  <SheetDescription>
                    Conoce el negocio y encuentra orientación para tu compra.
                  </SheetDescription>
                </SheetHeader>
                <nav className="menu-category-links" aria-label="Explorar categorías"><h2>Categorías</h2>{categories.map(category => <Link key={category.id} to={categoryPath(category)} onClick={() => MenuOpen(false)}>{category.name}</Link>)}</nav>
                <p className="menu-store-location"><MapPin size={16} aria-hidden="true" />Tu tienda cercana</p>
                <HelpMenuLinks />
              </SheetContent>
            </Sheet>
            <nav className="main-links" aria-label="Navegación de tienda">
              <NavLink to="/" end>
                Inicio
              </NavLink>
              <NavLink to="/catalogo">Catálogo</NavLink>
              {user?.role === "admin" ? (
                <Link to="/admin" className="admin-panel-link">
                  Panel
                </Link>
              ) : (
                <Link to="/catalogo?ofertas=1">Ofertas de prueba</Link>
              )}
            </nav>
            <nav className="category-inline" aria-label="Categorías de tienda">
              {categories.map((c) => (
                <NavLink key={c.id} to={categoryPath(c)}>
                  {c.name}
                </NavLink>
              ))}
            </nav>
            <span className="store-location">
              <MapPin size={15} aria-hidden="true" />
              Tu tienda cercana
            </span>
          </div>
        </div>
      </header>
      </div>
    </div>
  );
}
