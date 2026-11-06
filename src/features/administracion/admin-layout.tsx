import { useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  Menu,
  ArrowUpRight,
  LogOut,
  ShieldCheck,
  Tags,
  FileDown,
} from "lucide-react";
import { useRosita } from "@/hooks/use-rosita";
import { isAdmin, activeUser } from "@/lib/admin-operations";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
const sections = [
  { path: "/admin", label: "Resumen", icon: LayoutDashboard },
  { path: "/admin/productos", label: "Productos", icon: Package },
  {
    path: "/admin/categorias",
    label: "Categorías y subcategorías",
    icon: Tags,
  },
  { path: "/admin/inventario", label: "Inventario", icon: Boxes },
  { path: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { path: "/caja", label: "Caja", icon: Boxes },
  { path: "/admin/clientes", label: "Clientes", icon: ShieldCheck },
  { path: "/admin/agentes", label: "Agentes de caja", icon: ShieldCheck },
  { path: "/admin/ubicacion", label: "Origen de tienda", icon: Tags },
  { path: "/admin/reportes", label: "Reportes", icon: FileDown },
  { path: "/admin/personalizacion", label: "Personalización visual", icon: Tags },
];
export function AdminLayout() {
  const { state, dispatch, initialNotice } = useRosita(),
    location = useLocation(),
    navigate = useNavigate(),
    heading = useHeadingFocus(),
    [menu, MenuOpen] = useState(false),
    origin = useRef(""),
    user = activeUser(state);
  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname]);
  if (!isAdmin(state))
    return (
      <main className="container customer-empty">
        <ShieldCheck size={40} aria-hidden="true" />
        <h1 ref={heading} tabIndex={-1}>
          {user
            ? "Este espacio es para administración."
            : "Acceso de personal de demostración."}
        </h1>
        <p>
          {user
            ? "Tu perfil de cliente no puede gestionar productos, inventario o pedidos."
            : "Identifícate con el administrador ficticio para entrar al panel."}{" "}
          La separación local no equivale a seguridad de servidor.
        </p>
        <div className="customer-actions">
          <Button asChild>
            <Link to="/personal">Acceso de personal</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Volver a tienda</Link>
          </Button>
        </div>
      </main>
    );
  const nav = (
    <nav aria-label="Secciones administrativas">
      {sections.map((s) => (
        <NavLink
          key={s.path}
          to={s.path}
          end={s.path === "/admin"}
          onClick={() => MenuOpen(false)}
        >
          <s.icon size={20} aria-hidden="true" />
          {s.label}
        </NavLink>
      ))}
    </nav>
  );
  const title =
    [...sections].reverse().find((s) => location.pathname.startsWith(s.path))
      ?.label || "Administración";
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-contenido">
        Saltar al contenido
      </a>
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <img src="/images/rosita-logo.png" alt="Logotipo Rosita" />
          <span>
            Rosita<strong>Administración</strong>
          </span>
        </Link>
        <span className="admin-sidebar-label">TU NEGOCIO, EN ORDEN</span>
        {nav}
        <div className="admin-sidebar-bottom">
          <span>Prototipo local · 1.0.0</span>
          <p>
            Datos ficticios.
            <br />
            Sin cobros ni seguridad de servidor.
          </p>
          <Link to="/estado">Restablecer demostración</Link>
          <Link to="/">
            Consultar tienda <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-location">
            <Sheet
              open={menu}
              onOpenChange={(v) => {
                if (v) origin.current = location.pathname;
                MenuOpen(v);
              }}
            >
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="admin-menu-trigger"
                  aria-label="Abrir navegación administrativa"
                >
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="admin-menu-sheet"
                onCloseAutoFocus={(e) => {
                  if (origin.current !== location.pathname) {
                    e.preventDefault();
                    document
                      .querySelector<HTMLElement>("#admin-contenido h1")
                      ?.focus();
                  }
                }}
              >
                <SheetHeader>
                  <SheetTitle>Administración Rosita</SheetTitle>
                  <SheetDescription>
                    Gestión y reportes conectados a la tienda.
                  </SheetDescription>
                </SheetHeader>
                {nav}
              </SheetContent>
            </Sheet>
            <span>
              Administración <span aria-hidden="true">/</span>{" "}
              <strong>{title}</strong>
            </span>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-profile">
              <ShieldCheck size={16} aria-hidden="true" />
              Administrador demo
            </span>
            <Button asChild variant="outline">
              <Link to="/cuenta">Mi perfil</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                Ver tienda <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cerrar sesión administrativa"
              onClick={() => {
                dispatch({ type: "auth/logout" });
                navigate("/personal");
              }}
            >
              <LogOut size={18} aria-hidden="true" />
            </Button>
          </div>
        </header>
        <main id="admin-contenido" tabIndex={-1}>
          {initialNotice && (
            <Alert className="admin-storage-notice">
              <AlertTitle>Información de almacenamiento</AlertTitle>
              <AlertDescription>{initialNotice}</AlertDescription>
            </Alert>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
