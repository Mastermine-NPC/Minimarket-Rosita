import type L from "leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerCount, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

// Loaded only by tracking maps. Leaflet still owns the camera, selection and overlays.
setWorkerUrl(workerUrl);
setWorkerCount(2);
export const NIGHT_ATTRIBUTION = '<a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> · <a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

export function mountNightBasemap(map: L.Map, styleUrl: string, onReady: () => void, onFallback: () => void) {
  const probe = document.createElement("canvas").getContext("webgl2");
  if (!probe) throw new Error("Vector basemap requires WebGL2");
  probe.getExtension("WEBGL_lose_context")?.loseContext();
  const layer = maplibreGL({
    style: styleUrl,
    interactive: false,
    attributionControl: { customAttribution: NIGHT_ATTRIBUTION },
    maxTileCacheSize: 100,
    fadeDuration: 0,
    renderWorldCopies: false,
  });
  // A failed GL constructor must still let Leaflet remove its registered layer safely.
  const remove = layer.onRemove.bind(layer);
  layer.onRemove = function (host) {
    if (layer.getMaplibreMap()) return remove(host);
    layer.getContainer()?.remove();
    return this;
  };
  try { layer.addTo(map); }
  catch (error) { if (map.hasLayer(layer)) map.removeLayer(layer); throw error; }
  const vector = layer.getMaplibreMap();
  let active = true;
  const timeout = setTimeout(() => fail(), 18000);
  const ready = () => { if (active) { clearTimeout(timeout); onReady(); } };
  const cleanup = () => {
    if (!active) return;
    active = false; clearTimeout(timeout);
    vector.off("load", ready); vector.off("error", fail); vector.off("webglcontextlost", fail);
    if (map.hasLayer(layer)) map.removeLayer(layer);
  };
  const fail = (event?: unknown) => {
    if (!active) return;
    console.debug("Night basemap unavailable; using independent raster backup", event);
    // Do not remove a GL map in the middle of its render/error callback.
    queueMicrotask(() => { if (active) { cleanup(); onFallback(); } });
  };
  vector.on("load", ready);
  vector.on("error", fail);
  vector.on("webglcontextlost", fail);
  return cleanup;
}
