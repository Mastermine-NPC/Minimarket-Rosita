import type { GeoPoint } from "@/types/operations";
export const storeAddress =
  "UPIS Mercado Mayorista, Zona B, Manzana D, Lote 6, Arequipa";
export const storeOrigin: GeoPoint = {
  lat: -16.33112128439101,
  lng: -71.58692292883559,
  label: "Minimarket Rosita",
  source:
    "Coordenadas confirmadas por el usuario,30/10/2026; enlace corto apunta al sector, no verifica puerta",
};
export const utpCampus: GeoPoint = {
  lat: -16.408885688601682,
  lng: -71.54053906675192,
  label: "Pin oficial UTP Arequipa",
  source: "https://www.utp.edu.pe/como-llegar",
};
export const utpAccess: GeoPoint = {
  lat: -16.408537,
  lng: -71.540952,
  label: "UTP Tacna y Arica",
  source:
    "Llegada vial por Avenida Tacna y Arica, contrastada en OSM/OSRM a58.6m del pin oficial; puerta peatonal no verificada",
};
export const utpAddress = "Av. Tacna y Arica 160, Arequipa";
export const demoBounds = {
  south: -16.52,
  north: -16.25,
  west: -71.72,
  east: -71.43,
};
export const withinCoverage = (p: Pick<GeoPoint, "lat" | "lng">) =>
  Number.isFinite(p.lat) &&
  Number.isFinite(p.lng) &&
  p.lat >= demoBounds.south &&
  p.lat <= demoBounds.north &&
  p.lng >= demoBounds.west &&
  p.lng <= demoBounds.east;
