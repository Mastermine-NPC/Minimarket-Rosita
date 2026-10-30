import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
const schema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Escribe un nombre de prueba de al menos 2 caracteres."),
  correo: z.email("Escribe un correo con formato nombre@ejemplo.com."),
});
type FormValues = z.infer<typeof schema>;
export function ValidationForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", correo: "" },
  });
  function submit() {
    setSubmitted(true);
    toast.success("Formulario validado", {
      description:
        "Los datos son ficticios y no se enviaron a ningún servidor.",
    });
  }
  return (
    <form
      onChange={() => setSubmitted(false)}
      noValidate
      onSubmit={handleSubmit(submit)}
      className="validation-form"
    >
      <div className="field">
        <Label htmlFor="nombre">Nombre de prueba</Label>
        <Input
          id="nombre"
          autoComplete="off"
          placeholder="Cliente de prueba"
          aria-invalid={!!errors.nombre}
          aria-describedby={errors.nombre ? "nombre-error" : "form-hint"}
          {...register("nombre")}
        />
        {errors.nombre && (
          <p id="nombre-error" className="field-error" role="alert">
            ⚠ {errors.nombre.message}
          </p>
        )}
      </div>
      <div className="field">
        <Label htmlFor="correo">Correo de prueba</Label>
        <Input
          id="correo"
          type="email"
          autoComplete="off"
          placeholder="cliente@rosita.test"
          aria-invalid={!!errors.correo}
          aria-describedby={errors.correo ? "correo-error" : "form-hint"}
          {...register("correo")}
        />
        {errors.correo && (
          <p id="correo-error" className="field-error" role="alert">
            ⚠ {errors.correo.message}
          </p>
        )}
      </div>
      <p id="form-hint" className="hint">
        Usa datos ficticios. No se guardan estos campos ni se crea una cuenta.
      </p>
      <Button type="submit" disabled={isSubmitting}>
        <Send aria-hidden="true" />
        Validar formulario
      </Button>
      {submitted && (
        <Alert className="success-alert" role="status">
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Validación correcta</AlertTitle>
          <AlertDescription>
            El formulario funciona. No se realizó ningún envío.
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
