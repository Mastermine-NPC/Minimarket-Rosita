import { motionTokens } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { toast } from "sonner";
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre (mínimo 2 caracteres).")
    .max(80),
  email: z.email("Escribe un correo como nombre@ejemplo.com.").max(200),
  subject: z
    .string()
    .trim()
    .min(3, "Indica el asunto (mínimo 3 caracteres).")
    .max(100),
  message: z
    .string()
    .trim()
    .min(10, "Cuéntanos tu consulta en al menos 10 caracteres.")
    .max(1500),
});
export function ContactPage() {
  const heading = useHeadingFocus(),
    [sent, Sent] = useState(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    resolveTimer = useRef<(() => void) | null>(null),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
      resolveTimer.current?.();
    };
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });
  return (
    <div className="container info-page">
      <header className="info-heading">
        <span className="eyebrow">HABLEMOS</span>
        <h1 ref={heading} tabIndex={-1}>
          Contacto
        </h1>
        <p>
          Un espacio para probar tu consulta. Este formulario no envía mensajes
          reales.
        </p>
      </header>
      <div className="contact-grid">
        <aside className="customer-panel">
          <MapPin aria-hidden="true" />
          <h2>Estamos cerca</h2>
          <p>
            UPIS Mercado Mayorista
            <br />
            Zn. B, Mz. D, Lt. 6
          </p>
          <p>
            <Phone size={18} aria-hidden="true" /> +51 938 572 212
          </p>
          <p className="hint">
            Datos del informe y anexos del proyecto. No se verificó un horario
            comercial actual.
          </p>
          <Mail aria-hidden="true" />
          <p>Completar la consulta aquí solo demuestra el envío.</p>
        </aside>
        <form
          noValidate
          className="customer-form customer-panel"
          onChange={() => Sent(false)}
          onSubmit={(event) =>
            void handleSubmit(async () => {
              Sent(false);
              await new Promise<void>((resolve) => {
                resolveTimer.current = resolve;
                timer.current = setTimeout(
                  resolve,
                  motionTokens.processing * 1000,
                );
              });
              if (!alive.current) return;
              Sent(true);
              toast.success("Consulta simulada completada", {
                description: "No se envió un correo ni se contactó al negocio.",
              });
            })(event)
          }
        >
          {(["name", "email", "subject", "message"] as const).map((key) => (
            <div className="field" key={key}>
              <Label htmlFor={"contact-" + key}>
                {
                  {
                    name: "Nombre",
                    email: "Correo electrónico",
                    subject: "Asunto",
                    message: "Mensaje",
                  }[key]
                }
              </Label>
              {key === "message" ? (
                <textarea
                  id={"contact-" + key}
                  rows={5}
                  {...register(key)}
                  aria-invalid={!!errors[key]}
                  aria-describedby={
                    errors[key] ? "contact-" + key + "-error" : undefined
                  }
                />
              ) : (
                <Input
                  id={"contact-" + key}
                  type={key === "email" ? "email" : "text"}
                  {...register(key)}
                  aria-invalid={!!errors[key]}
                  aria-describedby={
                    errors[key] ? "contact-" + key + "-error" : undefined
                  }
                />
              )}{" "}
              {errors[key] && (
                <p
                  role="alert"
                  className="field-error"
                  id={"contact-" + key + "-error"}
                >
                  ⚠ {errors[key]?.message}
                </p>
              )}
            </div>
          ))}
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting
              ? "Procesando consulta…"
              : "Enviar consulta de demostración"}
          </Button>
          {sent && (
            <div className="success-message" role="status">
              <strong>Consulta de demostración completada.</strong>
              <p>No se envió ningún mensaje real.</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  Sent(false);
                }}
              >
                Escribir otra consulta
              </Button>
            </div>
          )}
          <p className="hint">
            No incluyas información sensible. No guardamos ni enviamos el
            contenido.
          </p>
        </form>
      </div>
    </div>
  );
}
