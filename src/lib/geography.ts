import type { GeoPoint, RoadRoute } from "@/types/operations";
export function distanceBetween(
  a: Pick<GeoPoint, "lat" | "lng">,
  b: Pick<GeoPoint, "lat" | "lng">,
) {
  const r = Math.PI / 180,
    dlat = (b.lat - a.lat) * r,
    dlng = (b.lng - a.lng) * r;
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dlng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function pointOnRoute(route: RoadRoute, progress: number) {
  const coords = route.coordinates;
  const lengths = coords
    .slice(1)
    .map((c, i) =>
      distanceBetween(
        { lng: coords[i][0], lat: coords[i][1] },
        { lng: c[0], lat: c[1] },
      ),
    );
  const total = lengths.reduce((s, n) => s + n, 0),
    target = Math.max(0, Math.min(1, progress)) * total;
  let previous = 0,
    index = 0;
  while (index < lengths.length - 1 && previous + lengths[index] < target) {
    previous += lengths[index];
    index++;
  }
  const a = coords[index],
    b = coords[index + 1] || a,
    t = lengths[index] ? (target - previous) / lengths[index] : 0;
  const point: [number, number] = [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
  const r = Math.PI / 180,
    y = Math.sin((b[0] - a[0]) * r) * Math.cos(b[1] * r),
    x =
      Math.cos(a[1] * r) * Math.sin(b[1] * r) -
      Math.sin(a[1] * r) * Math.cos(b[1] * r) * Math.cos((b[0] - a[0]) * r);
  return {
    point,
    bearing: (Math.atan2(y, x) / r + 360) % 360,
    travelled: [...coords.slice(0, index + 1), point] as [number, number][],
  };
}
