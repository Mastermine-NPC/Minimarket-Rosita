import { InternationalPhone } from "./international-phone";
import { phoneCountry } from "@/lib/phone";
import { DestinationSearch } from "@/features/entrega/destination-search";
import "@/styles/order-tracking.css";
import "@/styles/checkout-controls.css";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deliverySchema } from "@/lib/checkout-validation";
import { useRosita } from "@/hooks/use-rosita";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RouteMap } from "@/features/entrega/route-map";
import { calculateRoute } from "@/lib/routing";
import {
  storeAddress,
  utpAccess,
  utpAddress,
  withinCoverage,
} from "@/data/geography";
import { money } from "@/lib/currency";
import type { Delivery } from "@/types/commerce";
import type { GeoPoint } from "@/types/operations";
export function DeliveryForm() {
  const { state, dispatch } = useRosita(),
    heading = useHeadingFocus(),
    origin = state.storeLocation;
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<Delivery>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { ...state.checkout.delivery, phoneCountry: state.checkout.delivery.phoneCountry || phoneCountry(state.checkout.delivery.phone), phoneType: state.checkout.delivery.phoneType || "other", origin },
  });
  const { field: phoneField } = useController({ control, name: "phone" });
  const values = useWatch({ control }) as Delivery,
    pickup = values.mode === "pickup",
    point = values.point,
    [busy, Busy] = useState(false),
    [message, Message] = useState(""),
    [lat, Lat] = useState(String(point?.lat || utpAccess.lat)),
    [lng, Lng] = useState(String(point?.lng || utpAccess.lng)),
    request = useRef<AbortController | null>(null),
    generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
      request.current?.abort();
    },
    [],
  );
  function sync() {
    dispatch({ type: "checkout/draft-delivery", delivery: getValues() });
  }
  function invalidate() {
    generation.current++;
    request.current?.abort();
    Busy(false);
    setValue("route", undefined);
    setValue("pointConfirmed", false);
    setValue("zone", "");
    Message("El punto cambió. Confírmalo para calcular el recorrido.");
  }
  function pick(p: GeoPoint) {
    invalidate();
    setValue("point", p);
    Lat(String(p.lat));
    Lng(String(p.lng));
    sync();
  }
  async function confirm() {
    if (!point || !withinCoverage(point)) {
      Message("Selecciona coordenadas dentro del área ficticia de Arequipa.");
      return;
    }
    const id = ++generation.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    Busy(true);
    setValue("pointConfirmed", false);
    setValue("route", undefined);
    sync();
    Message("Calculando ruta por calles…");
    try {
      const route = await calculateRoute(origin, point, controller.signal);
      if (id !== generation.current) return;
      setValue("origin", { ...origin });
      setValue("route", route);
      setValue("pointConfirmed", true);
      setValue("zone", route.distance <= 7000 ? "demo-a" : "demo-b");
      sync();
      Message(
        route.fallback
          ? "✓ Punto confirmado. Se usa la ruta Rosita → UTP verificada y guardada; el servicio no respondió."
          : "✓ Punto confirmado y ruta vial calculada.",
      );
    } catch (e) {
      if (id === generation.current)
        Message(e instanceof Error ? e.message : "No se pudo calcular.");
    } finally {
      if (id === generation.current) Busy(false);
    }
  }
  return (
    <section className="customer-panel">
      <span className="eyebrow">PASO 1 DE 3</span>
      <h2 ref={heading} tabIndex={-1}>
        Entrega o recojo
      </h2>
      <p>
        Datos ficticios y tarifas de demostración. No se envía un pedido al
        negocio.
      </p>
      <form
        className="customer-form"
        noValidate
        onChange={sync}
        onSubmit={handleSubmit((v) => {
          const delivery: Delivery = pickup
            ? {
                mode: "pickup",
                recipient: v.recipient,
                phone: v.phone,
                phoneCountry: v.phoneCountry,
                phoneType: v.phoneType,
                address: storeAddress,
                reference: "",
                zone: "pickup",
                origin: { ...origin },
              }
            : v;
          dispatch({ type: "checkout/delivery", delivery });
        })}
      >
        <div className="field">
          <Label htmlFor="delivery-mode">¿Cómo lo recibirías?</Label>
          <select
            id="delivery-mode"
            {...register("mode")}
            onChange={(e) => {
              invalidate();
              setValue("mode", e.target.value as "delivery" | "pickup");
              if (e.target.value === "pickup") setValue("zone", "pickup");
              sync();
            }}
          >
            <option value="delivery">Delivery simulado</option>
            <option value="pickup">Recojo en tienda · envío S/ 0.00</option>
          </select>
        </div>
        <div className="location-summary">
          <strong>Origen fijo · Minimarket Rosita</strong>
          <p>{storeAddress}</p>
          <small>
            {origin.lat}, {origin.lng} · Punto confirmado por el usuario.
          </small>
        </div>
        <div className="field">
          <Label htmlFor="delivery-recipient">{pickup ? "Nombre de quien recoge" : "Nombre de quien recibe"}</Label>
          <Input id="delivery-recipient" {...register("recipient")} autoComplete="name" aria-invalid={!!errors.recipient} aria-describedby={errors.recipient ? "recipient-error" : undefined} />
          {errors.recipient && <p id="recipient-error" className="field-error" role="alert">{errors.recipient.message}</p>}
        </div>
        <InternationalPhone inputRef={phoneField.ref} value={phoneField.value || ""} country={values.phoneCountry} kind={values.phoneType} error={errors.phone?.message} onChange={(phone, country, kind) => {
          setValue("phoneCountry", country, { shouldDirty: true });
          setValue("phoneType", kind, { shouldDirty: true });
          setValue("phone", phone, { shouldDirty: true, shouldValidate: !!errors.phone });
          sync();
        }} onBlur={() => { phoneField.onBlur(); sync(); }} />
        {!pickup && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setValue("address", utpAddress);
                pick({ ...utpAccess });
              }}
            >
              Elegir UTP Tacna y Arica
            </Button>
            <p className="hint">
              Destino sugerido: {utpAddress}. Llegada vial sobre la avenida; el
              acceso peatonal exacto no está verificado. Puedes elegir otro
              destino.
            </p>
            <DestinationSearch embedded origin={origin} onSelect={selected => {
              if (!withinCoverage(selected)) { Message("La dirección está fuera del área de demostración de Arequipa. Elige otra ubicación."); return; }
              setValue("address", selected.label.slice(0, 180)); pick(selected);
            }} />
            <RouteMap
              theme="dark-night"
              origin={origin}
              destination={point}
              route={values.route}
              onSelect={pick}
            />
            <div className="coordinate-fields">
              <div className="field">
                <Label htmlFor="destination-lat">Latitud del destino</Label>
                <Input
                  id="destination-lat"
                  value={lat}
                  onChange={(e) => {
                    Lat(e.target.value);
                    setValue("point", undefined);
                    invalidate();
                    sync();
                  }}
                  inputMode="decimal"
                />
              </div>
              <div className="field">
                <Label htmlFor="destination-lng">Longitud del destino</Label>
                <Input
                  id="destination-lng"
                  value={lng}
                  onChange={(e) => {
                    Lng(e.target.value);
                    setValue("point", undefined);
                    invalidate();
                    sync();
                  }}
                  inputMode="decimal"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const latn = Number(lat),
                  lngn = Number(lng);
                if (
                  !lat.trim() ||
                  !lng.trim() ||
                  !withinCoverage({ lat: latn, lng: lngn })
                ) {
                  Message("Coordenadas inválidas o fuera del área ficticia.");
                  return;
                }
                pick({
                  lat: latn,
                  lng: lngn,
                  label: "Destino por coordenadas",
                  source: "Coordenadas introducidas por el usuario",
                });
              }}
            >
              Seleccionar coordenadas
            </Button>
            <p className="hint">
              Área ficticia: latitudes −16.52 a −16.25 y longitudes −71.72 a
              −71.43. No representa cobertura comercial real. Clic en el mapa o
              arrastra el pin; confirma después. Solo se envían coordenadas al
              proveedor de rutas.
            </p>
            {(["address", "reference"] as const).map((key) => (
              <div className="field" key={key}>
                <Label htmlFor={"delivery-" + key}>
                  {key === "address"
                    ? "Dirección escrita"
                    : "Referencia (opcional)"}
                </Label>
                <Input
                  id={"delivery-" + key}
                  {...register(key)}
                  autoComplete="off"
                  aria-invalid={!!errors[key]}
                  aria-describedby={errors[key] ? key + "-error" : undefined}
                />
                {errors[key] && (
                  <p id={key + "-error"} role="alert" className="field-error">
                    ⚠ {errors[key]?.message}
                  </p>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              disabled={busy || !point}
              aria-busy={busy}
              onClick={() => void confirm()}
            >
              {busy ? "Calculando…" : "Confirmar punto y calcular ruta"}
            </Button>
            <p role="status">{message}</p>
            {values.route && (
              <p>
                {(values.route.distance / 1000).toFixed(2)} km ·{" "}
                {Math.round(values.route.duration / 60)} min estimados por el
                proveedor, sin tráfico en vivo. Envío ficticio:{" "}
                <strong>
                  {money(values.route.distance <= 7000 ? 400 : 650)}
                </strong>
                .
              </p>
            )}
            {(
              ["point", "pointConfirmed", "route", "origin", "zone"] as const
            ).map(
              (key) =>
                errors[key] && (
                  <p role="alert" className="field-error" key={key}>
                    ⚠{" "}
                    {String(
                      errors[key]?.message || "Confirma el punto de entrega.",
                    )}
                  </p>
                ),
            )}
          </>
        )}
        {pickup && (
          <>
            <RouteMap theme="dark-night" origin={origin} />
            <p>
              Envío cero. Estados de preparación y recojo; sin repartidor ni
              ruta.
            </p>
          </>
        )}
        <Button type="submit" disabled={busy}>
          Continuar al pago simulado
        </Button>
      </form>
    </section>
  );
}
