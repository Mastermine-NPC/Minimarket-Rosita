import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOperation } from "@/hooks/use-operation";
import type { DemoUser } from "@/types/commerce";
const schema = z.object({
  name: z.string().trim().min(2, "Escribe al menos dos caracteres.").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Escribe un correo válido.")
    .max(200),
});
export function ProfileForm({ user }: { user: DemoUser }) {
  const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(schema),
      defaultValues: { name: user.name, email: user.email },
    }),
    { run, error, pending } = useOperation(
      () => {},
      "Perfil actualizado en este navegador",
    );
  return (
    <form
      className="customer-form"
      noValidate
      onSubmit={handleSubmit((v) =>
        run((operationId, at) => ({
          type: "profile/save",
          id: user.id,
          ...v,
          operationId,
          at,
        })),
      )}
    >
      {(["name", "email"] as const).map((key) => (
        <div className="field" key={key}>
          <Label htmlFor={"profile-" + key}>
            {key === "name" ? "Nombre" : "Correo de prueba"}
          </Label>
          <Input
            id={"profile-" + key}
            type={key === "email" ? "email" : "text"}
            {...register(key)}
            aria-invalid={!!errors[key]}
            aria-describedby={
              errors[key] ? "profile-" + key + "-error" : undefined
            }
          />
          {errors[key] && (
            <p
              role="alert"
              className="field-error"
              id={"profile-" + key + "-error"}
            >
              ⚠ {errors[key].message}
            </p>
          )}
        </div>
      ))}
      {error && (
        <p role="alert" className="field-error">
          ⚠ {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar perfil"}
      </Button>
      <p className="hint">
        Solo tus datos locales. No modifica rol, contraseña ni copias históricas
        de pedidos.
      </p>
    </form>
  );
}
