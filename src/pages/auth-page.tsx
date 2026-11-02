import { AmbientVideo } from "@/features/inicio/ambient-video";
import { useRosita } from "@/hooks/use-rosita";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, ShoppingBag, Leaf } from "lucide-react";
import { AuthForm } from "@/features/acceso/auth-form";
import { safeCustomerReturn } from "@/lib/customer-return";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
export function AuthPage({
  mode,
  personnel = false,
}: {
  mode: "login" | "registro";
  personnel?: boolean;
}) {
  const [params] = useSearchParams(),
    heading = useHeadingFocus(),
    registering = mode === "registro";
  const { state } = useRosita(),
    admin = state.users.find((u) => u.role === "admin");
  return (
    <div className="container auth-page">
      <section className="auth-story">
        <span className="eyebrow">TU TIENDA DE SIEMPRE</span>
        <h2>
          Todo lo tuyo,
          <br />
          más cerca<span>.</span>
        </h2>
        <p>
          Prepara tu compra y prueba el recorrido completo, con la cercanía de
          Rosita.
        </p>
        <AmbientVideo src="/images/video/web/video-intro.mp4" poster="/images/video/web/video-intro-poster.jpg" label="La experiencia Rosita" loop />
        <div className="auth-story-footer">
          <Leaf aria-hidden="true" />
          <span>
            Una experiencia local.
            <br />
            Sin cobros ni entregas reales.
          </span>
        </div>
      </section>
      <section className="auth-card">
        <Link className="back-link" to="/carrito">
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al carrito
        </Link>
        <span className="eyebrow">
          <ShoppingBag size={16} aria-hidden="true" /> CUENTA DE DEMOSTRACIÓN
        </span>
        <h1 ref={heading} tabIndex={-1}>
          {personnel
            ? "Tu negocio, en orden."
            : registering
              ? "Un gusto tenerte aquí."
              : "Qué bueno verte."}
        </h1>
        <p>
          {registering
            ? "Crea una cuenta ficticia para probar tus pedidos."
            : "Ingresa con una cuenta creada en este navegador."}
        </p>
        {personnel && (
          <div className="admin-demo-credentials">
            <strong>Personal de demostración</strong>
            <p>
              Correo: {admin?.email || "admin@rosita.test"}
              <br />
              Contraseña ficticia: RositaDemo!2026
            </p>
            <p>Perfil local simulado, sin seguridad de servidor.</p>
          </div>
        )}
        <AuthForm
          key={mode}
          mode={mode}
          returnTo={
            personnel ? "/admin" : safeCustomerReturn(params.get("volver"))
          }
        />
      </section>
    </div>
  );
}
