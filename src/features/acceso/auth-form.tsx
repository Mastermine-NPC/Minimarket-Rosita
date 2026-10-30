import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PasswordField } from "./password-field";
import { useRosita } from "@/hooks/use-rosita";
import {
  createVerifier,
  verifyPassword,
  normalizeEmail,
} from "@/lib/demo-auth";
import { toast } from "sonner";
export function AuthForm({
  mode,
  returnTo,
}: {
  mode: "login" | "registro";
  returnTo: string;
}) {
  const registering = mode === "registro",
    { state, dispatch } = useRosita(),
    navigate = useNavigate();
  const schema = z
    .object({
      name: registering
        ? z
            .string()
            .trim()
            .min(2, "Escribe tu nombre (mínimo 2 caracteres).")
            .max(80, "Usa hasta 80 caracteres.")
        : z.string(),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Escribe un correo con formato nombre@ejemplo.com.")
        .max(200),
      password: z
        .string()
        .min(
          registering ? 6 : 1,
          registering
            ? "Usa al menos 6 caracteres para esta contraseña ficticia."
            : "Escribe tu contraseña de demostración.",
        )
        .max(128, "Usa hasta 128 caracteres."),
      confirm: registering
        ? z.string().min(1, "Repite tu contraseña ficticia.")
        : z.string(),
    })
    .superRefine((v, ctx) => {
      if (registering && v.password !== v.confirm)
        ctx.addIssue({
          code: "custom",
          path: ["confirm"],
          message:
            "Las contraseñas no coinciden. Repite la contraseña ficticia.",
        });
    });
  const {
    register,
    setValue,
    clearErrors,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });
  useEffect(() => {
    const user = state.users.find((u) => u.id === state.sessionUserId);
    if (user)
      navigate(
        user.role === "admin"
          ? "/admin"
          : returnTo === "/admin"
            ? "/cuenta"
            : returnTo,
        { replace: true },
      );
  }, [state.sessionUserId, state.users, navigate, returnTo]);
  async function submit(values: z.infer<typeof schema>) {
    const email = normalizeEmail(values.email),
      existing = state.users.find((u) => u.email === email);
    try {
      if (registering) {
        if (existing) {
          setError(
            "email",
            { message: "Ya existe una cuenta con este correo. Inicia sesión." },
            { shouldFocus: true },
          );
          return;
        }
        const verification = await createVerifier(values.password);
        dispatch({
          type: "auth/register",
          user: {
            id: crypto.randomUUID(),
            name: values.name.trim(),
            email,
            ...verification,
            createdAt: new Date().toISOString(),
          },
        });
        toast.success("Cuenta de demostración creada", {
          description:
            "Tu carrito se conserva. No se enviaron datos a un servidor.",
        });
      } else {
        if (!existing || !(await verifyPassword(values.password, existing))) {
          setError("root", {
            message: "El correo o la contraseña de demostración no coinciden.",
          });
          setError(
            "password",
            { message: "Revisa tus datos de acceso locales." },
            { shouldFocus: true },
          );
          return;
        }
        dispatch({ type: "auth/login", userId: existing.id });
        toast.success("Sesión de demostración iniciada");
      }
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo completar el acceso local. Vuelve a intentarlo.",
      });
    }
  }
  return (
    <form className="customer-form" noValidate onSubmit={handleSubmit(submit)}>
      {!registering && (
        <section className="demo-access" aria-label="Accesos de demostración">
          <h2>Accesos de demostración</h2>
          <p>
            Completa datos ficticios para la exposición y pulsa Iniciar sesión.
            El cliente compra; el administrador gestiona. No hay caja ni perfil
            de cajero implementados.
          </p>
          {[
            state.users.find((u) => u.role === "customer" && u.demoAccess),
            state.users.find((u) => u.role === "admin"),
          ]
            .filter((u) => !!u)
            .map((user) => (
              <div key={user.id}>
                <strong>
                  {user.role === "admin" ? "Administrador" : "Cliente"}
                </strong>
                <span>{user.email}</span>
                <span>
                  Contraseña ficticia:{" "}
                  {user.role === "admin"
                    ? "RositaDemo!2026"
                    : "ClienteDemo!2026"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    clearErrors();
                    setValue("email", user.email);
                    setValue(
                      "password",
                      user.role === "admin"
                        ? "RositaDemo!2026"
                        : "ClienteDemo!2026",
                    );
                  }}
                >
                  Completar acceso de{" "}
                  {user.role === "admin" ? "administrador" : "cliente"}
                </Button>
              </div>
            ))}
        </section>
      )}
      {registering && (
        <div className="field">
          <Label htmlFor="auth-name">Nombre</Label>
          <Input
            id="auth-name"
            autoComplete="off"
            {...register("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "auth-name-error" : undefined}
          />
          {errors.name && (
            <p role="alert" className="field-error" id="auth-name-error">
              ⚠ {errors.name.message}
            </p>
          )}
        </div>
      )}
      <div className="field">
        <Label htmlFor="auth-email">Correo electrónico de prueba</Label>
        <Input
          id="auth-email"
          type="email"
          autoComplete="off"
          placeholder="cliente@rosita.test"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "auth-email-error" : undefined}
        />
        {errors.email && (
          <p role="alert" className="field-error" id="auth-email-error">
            ⚠ {errors.email.message}
          </p>
        )}
      </div>
      <div className="field">
        <Label htmlFor="auth-password">Contraseña ficticia</Label>
        <PasswordField
          id="auth-password"
          autoComplete="off"
          {...register("password")}
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password ? "auth-password-error" : "password-hint"
          }
        />
        <p className="hint" id="password-hint">
          Solo para este prototipo. No uses una contraseña real.
        </p>
        {errors.password && (
          <p role="alert" className="field-error" id="auth-password-error">
            ⚠ {errors.password.message}
          </p>
        )}
      </div>
      {registering && (
        <div className="field">
          <Label htmlFor="auth-confirm">Confirmar contraseña ficticia</Label>
          <PasswordField
            id="auth-confirm"
            label="confirmación de contraseña"
            autoComplete="off"
            {...register("confirm")}
            aria-invalid={!!errors.confirm}
            aria-describedby={errors.confirm ? "auth-confirm-error" : undefined}
          />
          {errors.confirm && (
            <p role="alert" className="field-error" id="auth-confirm-error">
              ⚠ {errors.confirm.message}
            </p>
          )}
        </div>
      )}
      {(errors.root || state.authError) && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos continuar</AlertTitle>
          <AlertDescription>
            {errors.root?.message || state.authError}
          </AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" />
            Procesando…
          </>
        ) : (
          <>
            {registering ? "Crear cuenta de demostración" : "Iniciar sesión"}
            <ArrowRight aria-hidden="true" />
          </>
        )}
      </Button>
      {returnTo === "/admin" ? (
        <p className="auth-switch">
          ¿Eres cliente? <Link to="/login">Acceso de clientes</Link>
        </p>
      ) : (
        <>
          <p className="auth-switch">
            {registering
              ? "¿Ya tienes una cuenta local? "
              : "¿Primera visita? "}
            <Link
              to={
                (registering ? "/login" : "/registro") +
                "?volver=" +
                encodeURIComponent(returnTo)
              }
            >
              {registering ? "Inicia sesión" : "Regístrate"}
            </Link>
          </p>
        </>
      )}
      <p className="auth-note">
        <ShieldCheck aria-hidden="true" />
        Acceso simulado y guardado en este navegador. No equivale a
        autenticación segura.
      </p>
    </form>
  );
}
