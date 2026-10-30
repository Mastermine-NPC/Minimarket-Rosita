import { useState } from "react";
import { useRosita } from "@/hooks/use-rosita";
import { useOperation } from "@/hooks/use-operation";
import { RouteMap } from "@/features/entrega/route-map";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withinCoverage, storeAddress, storeOrigin } from "@/data/geography";
import type { GeoPoint } from "@/types/operations";
export function StoreLocationPage() {
  const { state } = useRosita(),
    [lat, Lat] = useState(String(state.storeLocation.lat)),
    [lng, Lng] = useState(String(state.storeLocation.lng)),
    [point, Point] = useState(state.storeLocation),
    [error, Error] = useState(""),
    op = useOperation(() => {}, "Origen guardado para nuevos pedidos");
  function select(p: GeoPoint) {
    Point({
      ...p,
      label: "Minimarket Rosita",
      source:
        "Origen configurado explícitamente por administrador de demostración",
    });
    Lat(String(p.lat));
    Lng(String(p.lng));
  }
  return (
    <div className="admin-page">
      <span className="eyebrow">CONFIGURACIÓN LOCAL</span>
      <h1>Origen de Rosita</h1>
      <p>{storeAddress}</p>
      <p>
        Valor inicial confirmado por el usuario: {storeOrigin.lat},{" "}
        {storeOrigin.lng}. Los pedidos anteriores conservan su origen y
        recorrido guardados.
      </p>
      <div className="cash-panel customer-form">
        <RouteMap origin={point} onSelect={select} />
        <div className="coordinate-fields">
          <label>
            Latitud
            <Input
              value={lat}
              onChange={(e) => Lat(e.target.value)}
              inputMode="decimal"
            />
          </label>
          <label>
            Longitud
            <Input
              value={lng}
              onChange={(e) => Lng(e.target.value)}
              inputMode="decimal"
            />
          </label>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (
              !lat.trim() ||
              !lng.trim() ||
              !withinCoverage({ lat: Number(lat), lng: Number(lng) })
            ) {
              Error("Coordenadas fuera del área ficticia.");
              return;
            }
            Error("");
            select({
              lat: Number(lat),
              lng: Number(lng),
              label: "",
              source: "",
            });
          }}
        >
          Seleccionar coordenadas
        </Button>
        <p>
          Pin a guardar: {point.lat}, {point.lng}
        </p>
        <Button
          onClick={() =>
            op.run((operationId, at) => ({
              type: "store/location",
              operationId,
              at,
              point,
            }))
          }
          disabled={op.pending}
        >
          Confirmar origen para futuros pedidos
        </Button>
        {(error || op.error) && (
          <p role="alert" className="field-error">
            ⚠ {error || op.error}
          </p>
        )}
      </div>
    </div>
  );
}
