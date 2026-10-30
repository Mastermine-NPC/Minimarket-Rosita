import { ProfileForm } from "@/features/acceso/profile-form";
import { Link, useNavigate } from "react-router";
import { LogOut, Package, ArrowRight, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useRosita } from "@/hooks/use-rosita";
import { CustomerGate } from "@/features/acceso/customer-gate";
import { Button } from "@/components/ui/button";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
export function AccountPage() {
  const { state, dispatch } = useRosita(),
    heading = useHeadingFocus(),
    navigate = useNavigate(),
    user = state.users.find((u) => u.id === state.sessionUserId);
  if (!user) return <CustomerGate />;
  return (
    <div className="container customer-page account-page">
      <span className="eyebrow">TU ESPACIO EN ROSITA</span>
      <h1 ref={heading} tabIndex={-1}>
        Hola, {user.name}.
      </h1>
      <p>Esta es tu cuenta de demostración, guardada solo en este navegador.</p>
      <div className="account-grid">
        <section className="customer-panel">
          <UserRound aria-hidden="true" />
          <h2>Tus datos locales</h2>
          <ProfileForm key={user.id} user={user} />
          {user.role === "admin" && (
            <Button asChild>
              <Link to="/admin">Abrir panel administrativo</Link>
            </Button>
          )}
          <p className="hint">
            La sesión permanece al recargar hasta que la cierres o restablezcas
            Rosita. La separación local no proporciona seguridad de servidor.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              dispatch({ type: "auth/logout" });
              toast.success("Sesión cerrada. Tu carrito se conserva.");
              navigate("/login");
            }}
          >
            <LogOut aria-hidden="true" />
            Cerrar sesión
          </Button>
        </section>
        <section className="customer-panel account-orders">
          <Package size={32} aria-hidden="true" />
          <h2>Cada compra, a mano.</h2>
          <p>
            Consulta tus pedidos de prueba y avanza su seguimiento manualmente.
          </p>
          <Button asChild>
            <Link
              to={user.role === "admin" ? "/admin/pedidos" : "/mis-pedidos"}
            >
              {user.role === "admin" ? "Supervisar pedidos" : "Ver mis pedidos"}{" "}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Link className="text-link" to="/catalogo">
            Seguir comprando
          </Link>
        </section>
      </div>
    </div>
  );
}
