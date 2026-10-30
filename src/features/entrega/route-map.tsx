import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint, RoadRoute } from "@/types/operations";
import { demoBounds } from "@/data/geography";
import { pointOnRoute } from "@/lib/geography";
const ll = (p: GeoPoint): L.LatLngExpression => [p.lat, p.lng];
// Inline SVG keeps map markers independent of emoji/system font availability.
const icon = (kind: "store" | "destination" | "rider", label: string) => {
  const paths =
    kind === "store"
      ? '<path d="M3 10h18L19 3H5l-2 7Zm2 0v11h14V10M9 21v-7h6v7M8 3l-1 7m9-7 1 7"/>'
      : kind === "destination"
        ? '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
        : '<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 6-10 5 10H5m6-10H8m8-3h2l3 6M13 3h.01"/>';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    paths +
    "</svg>";
  const direction =
    kind === "rider"
      ? '<svg class="rider-direction" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1 13 13 7 10 1 13Z" fill="#145a46" stroke="white" stroke-width="1"/></svg>'
      : "";
  return L.divIcon({
    className: "rosita-map-pin",
    html:
      '<span role="img" aria-label="' +
      label +
      '">' +
      svg +
      direction +
      "</span>",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};
export function RouteMap({
  origin,
  destination,
  route,
  onSelect,
  progress = 0,
  showRider = false,
}: {
  origin: GeoPoint;
  destination?: GeoPoint;
  route?: RoadRoute;
  onSelect?: (p: GeoPoint) => void;
  progress?: number;
  showRider?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    layer = useRef<L.LayerGroup | null>(null),
    rider = useRef<L.Marker | null>(null),
    done = useRef<L.Polyline | null>(null),
    select = useRef(onSelect);
  const selectable = !!onSelect;
  const [failed, Failed] = useState(false);
  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    if (!root.current) return;
    const m = L.map(root.current, {
      scrollWheelZoom: false,
      maxBounds: [
        [demoBounds.south, demoBounds.west],
        [demoBounds.north, demoBounds.east],
      ],
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
    }).setView(ll(origin), 13);
    map.current = m;
    L.control
      .zoom({ zoomInTitle: "Acercar mapa", zoomOutTitle: "Alejar mapa" })
      .addTo(m);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener">Corregir mapa</a>',
    })
      .on("tileerror", () => Failed(true))
      .addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) =>
      select.current?.({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        label: "Destino seleccionado",
        source: "Pin seleccionado en mapa por el usuario",
      }),
    );
    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(root.current);
    return () => {
      observer.disconnect();
      m.remove();
      map.current = null;
    };
    // The instance lives for the mounted viewport. Props update its layers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const m = map.current,
      g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    rider.current = null;
    done.current = null;
    L.marker(ll(origin), {
      icon: icon("store", "Origen Rosita"),
      title: "Origen: " + origin.label,
    })
      .bindTooltip("Origen: " + origin.label)
      .addTo(g);
    if (destination) {
      const pin = L.marker(ll(destination), {
        icon: icon("destination", "Destino"),
        draggable: selectable,
        title: "Destino; arrastra para cambiar",
      })
        .addTo(g)
        .bindTooltip(destination.label);
      pin.on("dragend", () => {
        const c = pin.getLatLng();
        select.current?.({
          lat: c.lat,
          lng: c.lng,
          label: "Destino seleccionado",
          source: "Marcador arrastrado por el usuario",
        });
      });
    }
    if (route) {
      const points = route.coordinates.map(
        (c) => [c[1], c[0]] as L.LatLngTuple,
      );
      L.polyline(points, { color: "#77847d", weight: 5 }).addTo(g);
      done.current = L.polyline([], { color: "#145A46", weight: 6 }).addTo(g);
      if (showRider)
        rider.current = L.marker(points[0], {
          icon: icon("rider", "Repartidor simulado"),
          title: "Repartidor simulado; no es GPS",
        }).addTo(g);
      m.fitBounds(
        L.latLngBounds(points)
          .extend(ll(origin))
          .extend(ll(destination || origin)),
        { padding: [25, 25], animate: false },
      );
    } else if (destination)
      m.fitBounds(L.latLngBounds([ll(origin), ll(destination)]), {
        padding: [35, 35],
        maxZoom: 15,
        animate: false,
      });
    else m.setView(ll(origin), 15, { animate: false });
  }, [origin, destination, route, showRider, selectable]);
  useEffect(() => {
    if (!route) return;
    const p = pointOnRoute(route, progress);
    rider.current?.setLatLng([p.point[1], p.point[0]]);
    const el = rider.current?.getElement()?.querySelector(".rider-direction");
    if (el instanceof HTMLElement || el instanceof SVGElement)
      el.style.transform = "rotate(" + p.bearing + "deg)";
    done.current?.setLatLngs(p.travelled.map((c) => [c[1], c[0]]));
  }, [route, progress, showRider]);
  return (
    <div className="route-map-wrap">
      <div
        ref={root}
        className="route-map"
        aria-label="Mapa real de OpenStreetMap. Los campos de coordenadas permiten elegir el punto por teclado."
        data-no-cursor
      />
      {failed && (
        <p role="status" className="hint">
          No se cargaron algunas teselas. Puedes usar las coordenadas y el
          destino rápido; la ruta se calcula por separado.
        </p>
      )}
      <small>
        Mapa: Leaflet / OpenStreetMap. Rutas viales: OSRM / FOSSGIS. El mapa usa
        servicios externos.
      </small>
    </div>
  );
}
