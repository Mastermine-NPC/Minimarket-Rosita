import { Link } from "react-router";
import { UserRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
export function CustomerGate({ returnTo = "/cuenta" }: { returnTo?: string }) {
  const heading = useHeadingFocus(),
    query = "?volver=" + encodeURIComponent(returnTo);
  return (
    <section className="customer-empty container">
      <span className="empty-icon">
        <UserRound aria-hidden="true" />
      </span>
      <h1 ref={heading} tabIndex={-1}>
        Tu cuenta de demostración.
      </h1>
      <p>
        Puedes explorar y armar tu carrito libremente. Para realizar pedidos a
        domicilio, identifícate con una cuenta local de prueba.
      </p>
      <div className="customer-actions">
        <Button asChild>
          <Link to={"/login" + query}>
            Iniciar sesión <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={"/registro" + query}>Crear cuenta de demostración</Link>
        </Button>
      </div>
      <p className="hint">
        No utilices credenciales reales. Esta simulación no proporciona
        autenticación segura.
      </p>
    </section>
  );
}
