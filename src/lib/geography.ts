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
const measuredRoutes = new WeakMap<RoadRoute, { lengths: number[]; cumulative: number[]; total: number }>();
export function pointOnRoute(route: RoadRoute, progress: number) {
  const coords = route.coordinates;
  let measured = measuredRoutes.get(route);
  if (!measured) {
    const lengths = coords.slice(1).map((c, i) => distanceBetween(
      { lng: coords[i][0], lat: coords[i][1] }, { lng: c[0], lat: c[1] },
    ));
    const cumulative = [0];
    for (const length of lengths) cumulative.push(cumulative.at(-1)! + length);
    measured = { lengths, cumulative, total: cumulative.at(-1)! };
    measuredRoutes.set(route, measured);
  }
  const { lengths, cumulative, total } = measured;
  const target = Math.max(0, Math.min(1, progress)) * total;
  let low = 0, high = lengths.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (cumulative[mid + 1] < target) low = mid + 1;
    else high = mid;
  }
  const index = low, previous = cumulative[index];
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
