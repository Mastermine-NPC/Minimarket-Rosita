import verified from "@/data/verified-route.json";
import { storeOrigin, utpAccess, withinCoverage } from "@/data/geography";
import { distanceBetween } from "./geography";
import type { GeoPoint, RoadRoute } from "@/types/operations";
export const ROUTING_PROVIDER = "OSRM · FOSSGIS / OpenStreetMap";
let lastRequest = 0;
export async function calculateRoute(
  origin: GeoPoint,
  destination: GeoPoint,
  signal: AbortSignal,
): Promise<RoadRoute> {
  if (!withinCoverage(origin) || !withinCoverage(destination))
    throw new Error(
      "El punto está fuera del área ficticia de demostración en Arequipa.",
    );
  const wait = Math.max(0, lastRequest + 1100 - Date.now());
  if (wait)
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, wait);
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(new DOMException("Cancelado", "AbortError"));
        },
        { once: true },
      );
    });
  signal.throwIfAborted();
  lastRequest = Date.now();
  const controller = new AbortController(),
    abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 12000);
  try {
    const nearCampus = distanceBetween(destination, utpAccess) < 100;
    const url =
      "https://routing.openstreetmap.de/routed-car/route/v1/driving/" +
      origin.lng +
      "," +
      origin.lat +
      ";" +
      destination.lng +
      "," +
      destination.lat +
      "?overview=full&geometries=geojson&steps=false&radiuses=100;150" +
      (nearCampus ? "&bearings=;45,30" : "");
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Servicio de rutas no disponible.");
    const body = await response.json();
    const r = body.routes?.[0],
      coords = r?.geometry?.coordinates;
    if (
      body.code !== "Ok" ||
      !Array.isArray(coords) ||
      coords.length < 2 ||
      coords.length > 5000 ||
      !coords.every(
        (c: unknown) =>
          Array.isArray(c) &&
          c.length === 2 &&
          c.every((n) => typeof n === "number" && Number.isFinite(n)),
      ) ||
      !(r.distance > 0) ||
      !(r.duration > 0)
    )
      throw new Error("No se obtuvo una ruta vial válida.");
    signal.throwIfAborted();
    return {
      coordinates: coords,
      distance: r.distance,
      duration: r.duration,
      provider: ROUTING_PROVIDER,
      fetchedAt: new Date().toISOString(),
      origin: { ...origin },
      destination: { ...destination },
      start: coords[0],
      end: coords.at(-1),
    };
  } catch (error) {
    signal.throwIfAborted();
    if (
      distanceBetween(origin, storeOrigin) < 5 &&
      distanceBetween(destination, utpAccess) < 5
    )
      return {
        coordinates: verified.coordinates as [number, number][],
        distance: verified.distance,
        duration: verified.duration,
        start: verified.start as [number, number],
        end: verified.end as [number, number],
        provider: ROUTING_PROVIDER,
        fetchedAt: verified.fetchedAt,
        origin: { ...origin },
        destination: { ...destination },
        fallback: true,
      };
    throw new Error(
      "No se pudo obtener una ruta vial para este destino. Comprueba la conexión y confirma de nuevo, o elige recojo.",
      { cause: error },
    );
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
  }
}
