import { AmbientVideo } from "@/features/inicio/ambient-video";
import { useRosita } from "@/hooks/use-rosita";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { AuthForm } from "@/features/acceso/auth-form";
import { safeCustomerReturn } from "@/lib/customer-return";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import "@/styles/auth-screen.css";

export function AuthPage({ mode, personnel = false }: {
  mode: "login" | "registro";
  personnel?: boolean;
}) {
  const [params] = useSearchParams();
  const heading = useHeadingFocus();
  const registering = mode === "registro";
  const { state } = useRosita();
  const admin = state.users.find(user => user.role === "admin");
  return (
    <div className={`auth-screen ${registering ? "is-registering" : "is-login"}`}>
      <section className="auth-visual" aria-label="La experiencia Rosita">
        <AmbientVideo src="/images/video/web/video-intro.mp4" poster="/images/video/web/video-intro-poster.jpg" label="La experiencia Rosita" loop priority />
        <Link className="auth-wordmark" to="/" aria-label="Minimarket Rosita, inicio">
          <img src="/images/rosita-logo.png" width="48" height="48" alt="" />
          <span>Minimarket<strong>Rosita.</strong></span>
        </Link>
        <div className="auth-visual-copy">
          <h2>Todo lo tuyo,<br />más cerca.</h2>
          <p>Prepara tu compra y prueba el recorrido completo, con la cercanía de Rosita.</p>
          <Link to="/catalogo">Explorar Rosita <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="auth-visual-footer"><span><MapPin size={16} aria-hidden="true" /> Arequipa, Perú</span><span>Una experiencia local.<br />Sin cobros ni entregas reales.</span></div>
      </section>
      <section className="auth-workspace" aria-labelledby="auth-title">
        <Link className="auth-back" to="/carrito"><ArrowLeft size={18} aria-hidden="true" />Volver al carrito</Link>
        <div className="auth-form-view" key={personnel ? "personal" : mode}>
          <div className="auth-view-heading">
            <h1 id="auth-title" ref={heading} tabIndex={-1}>{personnel ? "Tu negocio, en orden." : registering ? "Un gusto tenerte aquí." : "Qué bueno verte."}</h1>
            <p>{registering ? "Crea una cuenta ficticia para probar tus pedidos." : "Ingresa con una cuenta creada en este navegador."}</p>
          </div>
          {personnel && <div className="admin-demo-credentials"><strong>Personal de demostración</strong><p>Correo: {admin?.email || "admin@rosita.test"}<br />Contraseña ficticia: RositaDemo!2026</p><p>Perfil local simulado, sin seguridad de servidor.</p></div>}
          <AuthForm key={mode} mode={mode} returnTo={personnel ? "/admin" : safeCustomerReturn(params.get("volver"))} />
        </div>
      </section>
    </div>
  );
}
