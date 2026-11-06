import { RouteTransition } from "@/features/cinema/route-transition";
import { AdminLayout } from "@/features/administracion/admin-layout";
import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "@/components/layout/app-layout";
import { PageMetadata } from "@/components/layout/page-metadata";
import { Skeleton } from "@/components/ui/skeleton";
const DesignSystemPage = lazy(()=>import("@/pages/admin/design-system-page").then(m=>({default:m.DesignSystemPage})));
const TaxonomyPage = lazy(() =>
  import("@/pages/admin/taxonomy-page").then((m) => ({
    default: m.TaxonomyPage,
  })),
);
const ReportsPage = lazy(() =>
  import("@/pages/admin/reports-page").then((m) => ({
    default: m.ReportsPage,
  })),
);
const AboutPage = lazy(() =>
  import("@/pages/about-page").then((m) => ({ default: m.AboutPage })),
);
const HelpPage = lazy(() =>
  import("@/pages/help-page").then((m) => ({ default: m.HelpPage })),
);
const ContactPage = lazy(() =>
  import("@/pages/contact-page").then((m) => ({ default: m.ContactPage })),
);
const HomePage = lazy(() =>
  import("@/pages/home-page").then((m) => ({ default: m.HomePage })),
);
const CatalogPage = lazy(() =>
  import("@/pages/catalog-page").then((m) => ({ default: m.CatalogPage })),
);
const ProductPage = lazy(() =>
  import("@/pages/product-page").then((m) => ({ default: m.ProductPage })),
);
const CartPage = lazy(() =>
  import("@/pages/cart-page").then((m) => ({ default: m.CartPage })),
);
const SystemPage = lazy(() =>
  import("@/pages/system-page").then((m) => ({ default: m.SystemPage })),
);
const CheckPage = lazy(() =>
  import("@/pages/check-page").then((m) => ({ default: m.CheckPage })),
);
const StatePage = lazy(() =>
  import("@/pages/state-page").then((m) => ({ default: m.StatePage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/not-found-page").then((m) => ({ default: m.NotFoundPage })),
);
const AuthPage = lazy(() =>
  import("@/pages/auth-page").then((m) => ({ default: m.AuthPage })),
);
const AccountPage = lazy(() =>
  import("@/pages/account-page").then((m) => ({ default: m.AccountPage })),
);
const CheckoutPage = lazy(() =>
  import("@/pages/checkout-page").then((m) => ({ default: m.CheckoutPage })),
);
const OrdersPage = lazy(() =>
  import("@/pages/orders-page").then((m) => ({ default: m.OrdersPage })),
);
const OrderPage = lazy(() =>
  import("@/pages/order-page").then((m) => ({ default: m.OrderPage })),
);
const CustomersPage = lazy(() => import("@/pages/admin/customers-page").then(m => ({ default: m.CustomersPage })));
const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/dashboard-page").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const AdminProductsPage = lazy(() =>
  import("@/pages/admin/products-page").then((m) => ({
    default: m.AdminProductsPage,
  })),
);
const AdminInventoryPage = lazy(() =>
  import("@/pages/admin/inventory-page").then((m) => ({
    default: m.AdminInventoryPage,
  })),
);
const AdminOrdersPage = lazy(() =>
  import("@/pages/admin/orders-page").then((m) => ({
    default: m.AdminOrdersPage,
  })),
);
const AdminOrderDetailPage = lazy(() =>
  import("@/pages/admin/order-detail-page").then((m) => ({
    default: m.AdminOrderDetailPage,
  })),
);
const CashPage = lazy(() =>
  import("@/pages/cash-page").then((m) => ({ default: m.CashPage })),
);
const AgentsPage = lazy(() =>
  import("@/pages/admin/agents-page").then((m) => ({ default: m.AgentsPage })),
);
const StoreLocationPage = lazy(() =>
  import("@/pages/admin/store-location-page").then((m) => ({
    default: m.StoreLocationPage,
  })),
);
function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <section
          className="container route-loading"
          aria-busy="true"
          aria-label="Cargando vista"
        >
          <p role="status">Cargando Rosita…</p>
          <Skeleton className="h-24 w-full" />
        </section>
      }
    >
      {children}
    </Suspense>
  );
}
export function AppRouter() {
  return (
    <><PageMetadata /><RouteTransition>{location => <Routes location={location}>
      <Route
        path="caja"
        element={
          <Page>
            <CashPage />
          </Page>
        }
      />
      <Route path="laboratorio-ui" element={<Navigate to="/admin/personalizacion/laboratorio" replace />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route path="personalizacion" element={<Page><DesignSystemPage /></Page>} />
        <Route path="personalizacion/:section" element={<Page><DesignSystemPage /></Page>} />
        <Route path="clientes" element={<Page><CustomersPage /></Page>} />
        <Route
          path="agentes"
          element={
            <Page>
              <AgentsPage />
            </Page>
          }
        />
        <Route
          path="ubicacion"
          element={
            <Page>
              <StoreLocationPage />
            </Page>
          }
        />
        <Route
          path="categorias"
          element={
            <Page>
              <TaxonomyPage />
            </Page>
          }
        />
        <Route
          path="reportes"
          element={
            <Page>
              <ReportsPage />
            </Page>
          }
        />
        <Route
          index
          element={
            <Page>
              <AdminDashboardPage />
            </Page>
          }
        />
        <Route
          path="productos"
          element={
            <Page>
              <AdminProductsPage />
            </Page>
          }
        />
        <Route
          path="inventario"
          element={
            <Page>
              <AdminInventoryPage />
            </Page>
          }
        />
        <Route
          path="pedidos"
          element={
            <Page>
              <AdminOrdersPage />
            </Page>
          }
        />
        <Route
          path="pedidos/:id"
          element={
            <Page>
              <AdminOrderDetailPage />
            </Page>
          }
        />
        <Route
          path="*"
          element={
            <div className="admin-page">
              <h1>Sección no encontrada</h1>
              <p>Utiliza las secciones del menú administrativo.</p>
            </div>
          }
        />
      </Route>
      <Route element={<AppLayout />}>
        <Route
          path="nosotros"
          element={
            <Page>
              <AboutPage />
            </Page>
          }
        />
        <Route
          path="ayuda"
          element={
            <Page>
              <HelpPage />
            </Page>
          }
        />
        <Route
          path="contacto"
          element={
            <Page>
              <ContactPage />
            </Page>
          }
        />
        <Route
          path="personal"
          element={
            <Page>
              <AuthPage mode="login" personnel />
            </Page>
          }
        />
        <Route
          path="login"
          element={
            <Page>
              <AuthPage mode="login" />
            </Page>
          }
        />
        <Route
          path="registro"
          element={
            <Page>
              <AuthPage mode="registro" />
            </Page>
          }
        />
        <Route
          path="cuenta"
          element={
            <Page>
              <AccountPage />
            </Page>
          }
        />
        <Route
          path="checkout"
          element={
            <Page>
              <CheckoutPage />
            </Page>
          }
        />
        <Route
          path="mis-pedidos"
          element={
            <Page>
              <OrdersPage />
            </Page>
          }
        />
        <Route
          path="pedido/:id"
          element={
            <Page>
              <OrderPage mode="detalle" />
            </Page>
          }
        />
        <Route
          path="pedido/:id/confirmacion"
          element={
            <Page>
              <OrderPage mode="confirmacion" />
            </Page>
          }
        />
        <Route
          path="pedido/:id/seguimiento"
          element={
            <Page>
              <OrderPage mode="seguimiento" />
            </Page>
          }
        />

        <Route
          index
          element={
            <Page>
              <HomePage />
            </Page>
          }
        />
        <Route
          path="catalogo"
          element={
            <Page>
              <CatalogPage />
            </Page>
          }
        />
        <Route
          path="categoria/:slug"
          element={
            <Page>
              <CatalogPage />
            </Page>
          }
        />
        <Route
          path="producto/:id"
          element={
            <Page>
              <ProductPage />
            </Page>
          }
        />
        <Route
          path="carrito"
          element={
            <Page>
              <CartPage />
            </Page>
          }
        />
        <Route
          path="sistema-diseno"
          element={
            <Page>
              <SystemPage />
            </Page>
          }
        />
        <Route
          path="comprobacion"
          element={
            <Page>
              <div className="technical-page container">
                <CheckPage />
              </div>
            </Page>
          }
        />
        <Route
          path="estado"
          element={
            <Page>
              <div className="technical-page container">
                <StatePage />
              </div>
            </Page>
          }
        />
        <Route
          path="*"
          element={
            <Page>
              <NotFoundPage />
            </Page>
          }
        />
      </Route>
    </Routes>}</RouteTransition></>
  );
}
