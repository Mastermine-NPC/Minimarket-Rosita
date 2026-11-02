import type { GeoPoint } from "@/types/operations";

// Photon-compatible endpoint, replaceable without changing application code.
// Deliberate searches only: no autocomplete, bounded requests and session cache.
const cache = new Map<string, GeoPoint[]>();
let nextRequest = 0;
export async function searchPlaces(query: string, focus: GeoPoint, signal: AbortSignal): Promise<GeoPoint[]> {
  const key = query.trim().toLocaleLowerCase();
  if (key.length < 3) return [];
  if (cache.has(key)) return cache.get(key)!;
  const reserved = Math.max(Date.now(), nextRequest);
  nextRequest = reserved + 1100;
  await new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException("Cancelado", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, reserved - Date.now());
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
  signal.throwIfAborted();
  const config: { geocodingUrl?: string } = await fetch("/map-services.json", { signal }).then(r => r.ok ? r.json() : {}).catch(error => { signal.throwIfAborted(); console.debug("Map service configuration unavailable", error); return {}; });
  const url = new URL(config.geocodingUrl || "https://photon.komoot.io/api/");
  url.search = new URLSearchParams({ q: query.trim(), limit: "6", lat: String(focus.lat), lon: String(focus.lng) }).toString();
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]) });
  if (!response.ok) throw new Error("La búsqueda no está disponible. Inténtalo nuevamente o elige el punto en el mapa.");
  const body = await response.json();
  if (!Array.isArray(body.features)) throw new Error("No pudimos interpretar los resultados. Prueba otra búsqueda.");
  const points: GeoPoint[] = [];
  for (const feature of body.features) {
    const c = feature.geometry?.coordinates, p = feature.properties;
    if (!Array.isArray(c) || c.length < 2 || !Number.isFinite(c[0]) || !Number.isFinite(c[1]) || Math.abs(c[0]) > 180 || Math.abs(c[1]) > 90 || !p) continue;
    const label = [...new Set([p.name, [p.street, p.housenumber].filter(Boolean).join(" "), p.city || p.town || p.village, p.state, p.country].filter(Boolean))].join(", ");
    if (label) points.push({ lng: c[0], lat: c[1], label, source: "Photon / OpenStreetMap" });
  }
  signal.throwIfAborted();
  if (cache.size >= 50) cache.delete(cache.keys().next().value!);
  cache.set(key, points);
  return points;
}
