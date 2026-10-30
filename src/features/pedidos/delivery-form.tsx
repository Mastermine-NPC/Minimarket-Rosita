import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { deliverySchema } from "@/lib/checkout-validation";
import { useRosita } from "@/hooks/use-rosita";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deliveryZones } from "@/data/delivery";
import { money } from "@/lib/currency";
import type { Delivery } from "@/types/commerce";
export function DeliveryForm() {
  const { state, dispatch } = useRosita(),
    heading = useHeadingFocus(),
    {
      register,
      handleSubmit,
      getValues,
      formState: { errors },
    } = useForm<Delivery>({
      resolver: zodResolver(deliverySchema),
      defaultValues: state.checkout.delivery,
    });
  return (
    <section className="customer-panel">
      <span className="eyebrow">PASO 1 DE 3</span>
      <h2 ref={heading} tabIndex={-1}>
        ¿Dónde lo recibirías?
      </h2>
      <p>
        Usa información ficticia. Las zonas, tarifas y tiempos son solo de
        demostración.
      </p>
      <form
        className="customer-form"
        noValidate
        onChange={() =>
          dispatch({ type: "checkout/draft-delivery", delivery: getValues() })
        }
        onSubmit={handleSubmit((delivery) =>
          dispatch({ type: "checkout/delivery", delivery }),
        )}
      >
        {(
          [
            ["recipient", "Nombre de quien recibe"],
            ["phone", "Celular peruano"],
            ["address", "Dirección"],
          ] as const
        ).map(([key, label]) => (
          <div className="field" key={key}>
            <Label htmlFor={"delivery-" + key}>{label}</Label>
            <Input
              id={"delivery-" + key}
              {...register(key)}
              autoComplete="off"
              type={key === "phone" ? "tel" : "text"}
              inputMode={key === "phone" ? "tel" : undefined}
              placeholder={
                key === "phone"
                  ? "999123456"
                  : key === "address"
                    ? "Calle de prueba 123"
                    : ""
              }
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? key + "-error" : undefined}
            />
            {errors[key] && (
              <p className="field-error" role="alert" id={key + "-error"}>
                ⚠ {errors[key].message}
              </p>
            )}
          </div>
        ))}
        <div className="field">
          <Label htmlFor="delivery-zone">Zona de entrega (demostración)</Label>
          <select
            id="delivery-zone"
            {...register("zone")}
            aria-invalid={!!errors.zone}
            aria-describedby={errors.zone ? "zone-error" : "zone-hint"}
          >
            <option value="">Selecciona una zona ficticia</option>
            {deliveryZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} · {money(z.feeCents)}
              </option>
            ))}
          </select>
          <p id="zone-hint" className="hint">
            Estas zonas no representan distritos ni cobertura real del negocio.
          </p>
          {errors.zone && (
            <p className="field-error" role="alert" id="zone-error">
              ⚠ {errors.zone.message}
            </p>
          )}
        </div>
        <div className="field">
          <Label htmlFor="delivery-reference">Referencia (opcional)</Label>
          <Input
            id="delivery-reference"
            {...register("reference")}
            autoComplete="off"
            aria-invalid={!!errors.reference}
            aria-describedby={errors.reference ? "reference-error" : undefined}
          />
          {errors.reference && (
            <p className="field-error" role="alert" id="reference-error">
              ⚠ {errors.reference.message}
            </p>
          )}
        </div>
        <Button type="submit">
          Continuar al pago simulado <ArrowRight aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
