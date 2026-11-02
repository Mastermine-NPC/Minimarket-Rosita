import { useEffect, useRef, useState, useImperativeHandle, useCallback, type Ref } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint, RoadRoute } from "@/types/operations";
import { demoBounds } from "@/data/geography";
import { pointOnRoute } from "@/lib/geography";
const ll = (p: GeoPoint): L.LatLngExpression => [p.lat, p.lng];
const tooltip = (label: string) => { const node = document.createElement("span"); node.textContent = label; return node; };
// Inline SVG keeps map markers independent of emoji/system font availability.
const icon = (kind: "store" | "destination" | "rider", label: string, night = false) => {
  const paths =
    kind === "store"
      ? '<path d="M3 10h18L19 3H5l-2 7Zm2 0v11h14V10M9 21v-7h6v7M8 3l-1 7m9-7 1 7"/>'
      : kind === "destination"
        ? '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
        : '<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 6-10 5 10H5m6-10H8m8-3h2l3 6M13 3h.01"/>';
  const svg =
    '<svg class="' + (kind === "rider" ? "rider-symbol" : "") + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    paths +
    "</svg>";
  const direction =
    kind === "rider"
      ? '<svg class="rider-direction" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1 13 13 7 10 1 13Z" fill="' + (night ? "#58e4dc" : "#145a46") + '" stroke="white" stroke-width="1"/></svg>'
      : "";
  return L.divIcon({
    className: "rosita-map-pin pin-" + kind,
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
export interface RouteMapPlayback { setProgress: (progress: number) => void; fitRoute: () => void }
export function RouteMap({
  origin,
  destination,
  route,
  onSelect,
  progress = 0,
  showRider = false,
  unrestricted = false,
  playbackRef,
  theme = "standard",
}: {
  origin: GeoPoint;
  destination?: GeoPoint;
  route?: RoadRoute;
  onSelect?: (p: GeoPoint) => void;
  progress?: number;
  showRider?: boolean;
  unrestricted?: boolean;
  playbackRef?: Ref<RouteMapPlayback>;
  theme?: "standard" | "dark-night";
}) {
  const root = useRef<HTMLDivElement>(null),
    map = useRef<L.Map | null>(null),
    layer = useRef<L.LayerGroup | null>(null),
    rider = useRef<L.Marker | null>(null),
    done = useRef<L.Polyline | null>(null),
    select = useRef(onSelect),
    fit = useRef<() => void>(() => {});
  const selectable = !!onSelect;
  const [baseStatus, setBaseStatus] = useState<"loading" | "standard" | "vector" | "fallback" | "unavailable">(theme === "dark-night" ? "loading" : "standard");
  const night = theme === "dark-night";
  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);
  const fitRoute = useCallback(() => {
    if (!map.current) return;
    const points: L.LatLngExpression[] = route ? route.coordinates.map(c => [c[1], c[0]]) : [ll(origin), ll(destination || origin)];
    map.current.fitBounds(L.latLngBounds(points).extend(ll(origin)).extend(ll(destination || origin)), { padding: [35, 35], maxZoom: 16, animate: false });
  }, [origin, destination, route]);
  useEffect(() => { fit.current = fitRoute; }, [fitRoute]);
  useEffect(() => {
    if (!root.current) return;
    const m = L.map(root.current, {
      scrollWheelZoom: false,
      maxBounds: unrestricted ? undefined : [
        [demoBounds.south, demoBounds.west],
        [demoBounds.north, demoBounds.east],
      ],
      minZoom: unrestricted ? 2 : 10,
      maxZoom: 18,
      zoomControl: false,
    }).setView(ll(origin), 13);
    map.current = m;
    L.control
      .zoom({ zoomInTitle: "Acercar mapa", zoomOutTitle: "Alejar mapa" })
      .addTo(m);
    let alive = true;
    let disposeBase: (() => void) | undefined;
    let startupTimeout: ReturnType<typeof setTimeout> | undefined;
    let usingBackup = false;
    const configRequest = new AbortController();
    const raster = (backup = false) => {
      if (!alive) return;
      usingBackup = backup; clearTimeout(startupTimeout);
      disposeBase?.();
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }).on("tileerror", () => { if (alive) setBaseStatus("unavailable"); }).addTo(m);
      disposeBase = () => { tiles.off(); tiles.remove(); };
      setBaseStatus(backup ? "fallback" : "standard");
    };
    if (night) {
      startupTimeout = setTimeout(() => raster(true), 20000);
      const config: Promise<{ trackingStyleUrl?: string }> = fetch("/map-services.json", { signal: configRequest.signal })
        .then(response => response.ok ? response.json() : {})
        .catch(() => ({}));
      Promise.all([import("./night-basemap"), config]).then(([basemap, settings]) => {
        if (!alive || usingBackup) return;
        disposeBase = basemap.mountNightBasemap(m, settings.trackingStyleUrl || "/maps/dark-night.json", () => { if (alive) { clearTimeout(startupTimeout); setBaseStatus("vector"); } }, () => raster(true));
      }).catch(error => { if (alive) { console.debug("Night basemap initialization failed", error); raster(true); } });
    } else raster();
    layer.current = L.layerGroup().addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) =>
      select.current?.({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        label: "Destino seleccionado",
        source: "Pin seleccionado en mapa por el usuario",
      }),
    );
    const observer = new ResizeObserver(() => { m.invalidateSize({ pan: false }); fit.current(); });
    observer.observe(root.current);
    return () => {
      alive = false; clearTimeout(startupTimeout); configRequest.abort(); disposeBase?.();
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
    done.current = null;
    L.marker(ll(origin), {
      icon: icon("store", "Origen Rosita", night),
      title: "Origen: " + origin.label,
    })
      .bindTooltip(tooltip("Origen: " + origin.label))
      .addTo(g);
    if (destination) {
      const roadDestination = route ? L.latLng(route.end[1], route.end[0]) : ll(destination);
      const pin = L.marker(roadDestination, {
        icon: icon("destination", "Destino", night),
        draggable: selectable,
        title: "Destino; arrastra para cambiar",
      })
        .addTo(g)
        .bindTooltip(tooltip(destination.label));
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
      if (night) L.polyline(points, { color: "#071322", weight: 10, opacity: .95, interactive: false }).addTo(g);
      L.polyline(points, { color: night ? "#37d3dc" : "#145a46", weight: 6, opacity: night ? .95 : .35, interactive: false }).addTo(g);
      done.current = L.polyline([], { color: night ? "#66f0e5" : "#145A46", weight: 6, opacity: 1, interactive: false }).addTo(g);
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
  }, [origin, destination, route, selectable, night]);
  useEffect(() => {
    if (!map.current || !route || !showRider) return;
    const first = route.coordinates[0];
    const marker = L.marker([first[1], first[0]], { icon: icon("rider", "Vehículo de simulación", night), zIndexOffset: 1000, title: "Vehículo de simulación; no es GPS" }).addTo(map.current);
    rider.current = marker;
    return () => { marker.remove(); if (rider.current === marker) rider.current = null; };
  }, [route, showRider, night]);
  const setProgress = useCallback((value: number) => {
    if (!route) return;
    const p = pointOnRoute(route, value);
    rider.current?.setLatLng([p.point[1], p.point[0]]);
    const el = rider.current?.getElement()?.querySelector(".rider-direction");
    if (el instanceof HTMLElement || el instanceof SVGElement) el.style.transform = "rotate(" + p.bearing + "deg)";
    const vehicle = rider.current?.getElement()?.querySelector<SVGElement>(".rider-symbol");
    if (vehicle) vehicle.style.transform = `rotate(${p.bearing - 90}deg)`;
    done.current?.setLatLngs(p.travelled.map(c => [c[1], c[0]]));
  }, [route]);
  useImperativeHandle(playbackRef, () => ({
    setProgress,
    fitRoute,
  }));
  useEffect(() => { setProgress(progress); }, [progress, setProgress, showRider]);
  return (
    <div className={"route-map-wrap" + (night ? " map-theme-night" : "")}>
      <div
        ref={root}
        className="route-map"
        data-basemap={baseStatus}
        aria-label={selectable ? "Mapa de la tienda y destino. Haz clic o arrastra el marcador para elegir una ubicación; también puedes usar la búsqueda." : "Mapa de la tienda y recorrido"}
        data-no-cursor
      />
      {baseStatus === "loading" && <span className="map-background-status" role="status">Cargando mapa nocturno…</span>}
      {(baseStatus === "fallback" || baseStatus === "unavailable") && (
        <p role="status" className="hint">
          {baseStatus === "fallback" ? "El estilo nocturno no está disponible. Se muestra el mapa de respaldo; tu recorrido se conserva." : "El fondo del mapa no está disponible. El destino y el recorrido se conservan."}
        </p>
      )}

    </div>
  );
}
