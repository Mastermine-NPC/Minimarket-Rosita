import { useCallback, useEffect, useRef, useState } from "react";
import { LocateFixed, Play, Pause, RotateCcw, MapPin, Route } from "lucide-react";
import { toast } from "sonner";
import { stagesFor } from "@/data/delivery";
import { useTrackingDemonstration } from "./use-tracking-demonstration";
import { orderDate } from "@/lib/order-date";
import { useRosita } from "@/hooks/use-rosita";
import { RouteMap, type RouteMapPlayback } from "./route-map";
import { DestinationSearch } from "./destination-search";
import { useRouteSimulation } from "./use-route-simulation";
import { calculateRoute } from "@/lib/routing";
import { distanceBetween } from "@/lib/geography";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/commerce";
import type { GeoPoint, RoadRoute } from "@/types/operations";
export function DeliveryTracking({ order }: { order: Order }) {
  const { state } = useRosita(), origin = state.storeLocation;
  const [destination, setDestination] = useState<GeoPoint | undefined>(order.delivery.point);
  const [route, setRoute] = useState<RoadRoute | undefined>(() => order.delivery.route && distanceBetween(order.delivery.route.origin, origin) < 1 ? order.delivery.route : undefined);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const request = useRef<AbortController | null>(null), playback = useRef<RouteMapPlayback>(null);
  const draw = useCallback((value: number) => playback.current?.setProgress(value), []);
  const demo = useTrackingDemonstration(order);
  const simulation = useRouteSimulation(draw, () => toast.info(demo.active ? "Demostración · Recorrido completado" : "Recorrido visual completado", { id: `route-completed:${order.id}`, description: "Llegar al destino del mapa no confirma la entrega del pedido." }));
  const canPlay = !!route && (demo.active ? demo.status === 2 : order.status === 2 && order.delivery.mode !== "pickup");
  const pauseSimulation = simulation.pause;
  useEffect(() => { if (!canPlay) pauseSimulation(); }, [canPlay, pauseSimulation]);
  function startDemo() { simulation.reset(); demo.enter(); }
  function leaveDemo() { simulation.reset(); demo.leave(); }
  function resetVisual() { simulation.reset(); demo.rewind(); }
  useEffect(() => () => request.current?.abort(), []);
  function select(point: GeoPoint) {
    request.current?.abort(); simulation.reset(); setBusy(false); setError(""); setRoute(undefined); setDestination(point);
  }
  async function confirm() {
    if (!destination) return;
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    simulation.reset(); setBusy(true); setError(""); setRoute(undefined);
    try {
      const next = await calculateRoute(origin, destination, controller.signal, { unrestricted: true });
      if (!controller.signal.aborted) setRoute(next);
    } catch (cause) {
      if (!controller.signal.aborted) { console.debug("Simulation route failed", cause); setError("No pudimos encontrar un recorrido por calles hasta ese punto. Puedes reintentar o mover el destino a una calle cercana."); }
    } finally { if (!controller.signal.aborted) setBusy(false); }
  }
  const roadOffset = route && destination ? distanceBetween(destination, { lat: route.end[1], lng: route.end[0] }) : 0;
  const storedArrival = !demo.active && order.status === 3;
  const visualProgress = storedArrival ? 1 : simulation.progress;
  const completed = visualProgress >= 1;
  const status = busy ? "Buscando recorrido" : storedArrival ? `${stagesFor(order.delivery)[3]} · estado registrado` : completed ? "Recorrido completado" : simulation.playing ? (demo.active ? `${stagesFor(order.delivery)[2]} · demostración` : `${stagesFor(order.delivery)[order.status]} · recorrido visual`) : simulation.progress > 0 ? "Simulación en pausa" : route ? (canPlay ? "Listo para iniciar" : demo.active ? `Demostración · ${stagesFor(order.delivery)[demo.status]}` : stagesFor(order.delivery)[order.status]) : "Elige y confirma un destino";
  return <section className="delivery-tracking tracking-map-panel" aria-labelledby="tracking-map-title">
    <div className="tracking-map-heading"><div><h2 id="tracking-map-title">Explora el recorrido</h2><p>Una simulación de 10 segundos. No representa el tiempo de entrega.</p></div><Button variant="ghost" aria-label="Ver recorrido completo" onClick={() => playback.current?.fitRoute()}><LocateFixed size={20} aria-hidden="true" /></Button></div>
    <div className="tracking-mode" role="group" aria-label="Modo de seguimiento"><Button variant={demo.active ? "outline" : "default"} aria-pressed={!demo.active} onClick={leaveDemo}>Estado del pedido</Button><Button variant={demo.active ? "default" : "outline"} aria-pressed={demo.active} disabled={demo.active} onClick={startDemo}>Probar demostración</Button></div>
    {demo.active ? <section className="tracking-demo" aria-label="Secuencia de demostración"><div><strong>Demostración · {stagesFor(order.delivery)[demo.status]}</strong><Button variant="ghost" onClick={startDemo}>Reiniciar demostración</Button></div><p>Ejemplo local. No cambia el pedido ni su historial. Las etapas anteriores al recorrido avanzan automáticamente.</p><ol>{demo.events.map(event => <li key={event.id}><span>{stagesFor(order.delivery)[event.to]}</span><time dateTime={event.at}>{orderDate(event.at)}</time></li>)}</ol></section> : <p className="tracking-hint">El estado guardado solo cambia desde administración. El recorrido visual está disponible cuando el pedido está En camino; puedes explorar el flujo sin cambios con Probar demostración.</p>}
    <DestinationSearch origin={origin} onSelect={select} />
    <p className="tracking-hint">También puedes tocar el mapa o arrastrar el marcador de destino.</p>
    <RouteMap theme="dark-night" origin={origin} destination={destination} route={route} onSelect={select} showRider={!!route && (demo.active ? demo.status >= 2 : order.status >= 2)} progress={!demo.active && order.status === 3 ? 1 : 0} unrestricted playbackRef={playback} />
    <div className="tracking-map-legend"><span><i className="legend-store" />Tienda Rosita</span><span><i className="legend-destination" />Destino</span><span><i className="legend-route" />Recorrido</span></div>
    <div className="tracking-destination"><MapPin size={20} aria-hidden="true" /><div><span>Destino de simulación</span><strong>{destination?.label || "Selecciona una ubicación"}</strong>{destination && <small>{destination.lat.toFixed(5)}, {destination.lng.toFixed(5)}</small>}</div>{destination && (!route || error) && <Button variant="outline" disabled={busy} onClick={confirm}>{busy ? "Calculando…" : error ? "Reintentar recorrido" : "Confirmar ubicación"}</Button>}</div>
    {route && roadOffset > 5 && <p className="tracking-hint">Llegada por la calle más cercana, a {Math.round(roadOffset)} m del punto elegido. El marcador de destino indica ese acceso.</p>}
    {error && <p className="tracking-error" role="alert">{error}</p>}
    <div className="tracking-route-summary"><div><span>Estado de la simulación</span><strong role="status">{status}</strong></div>{route && <div><span><Route size={15} aria-hidden="true" /> Distancia por calles</span><strong>{new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 }).format(route.distance / 1000)} km</strong></div>}</div>
    {route && <><div className="tracking-progress-label"><label htmlFor="route-progress">Recorrido visual</label><span>{Math.round(visualProgress * 100)}%</span></div><progress id="route-progress" max={1} value={visualProgress} aria-label="Progreso del recorrido visual" />
      <div className="tracking-playback-actions">{!completed && <Button disabled={!canPlay} onClick={simulation.playing ? simulation.pause : simulation.start}>{simulation.playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}{simulation.playing ? "Pausar" : simulation.progress > 0 ? "Reanudar" : "Iniciar simulación"}</Button>}{simulation.progress > 0 && !storedArrival && <Button variant="outline" onClick={resetVisual}><RotateCcw size={16} aria-hidden="true" />Reiniciar recorrido</Button>}</div>
      {completed && demo.active && demo.status === 2 && <Button className="demo-delivery-confirm" variant="outline" onClick={demo.deliver}>Simular entrega de ejemplo</Button>}
      {completed && <p className="tracking-complete">{storedArrival ? "El pedido tiene su entrega o recojo registrado. Puedes repetir el recorrido en modo demostración." : "Has llegado al destino de la simulación. El estado de entrega de tu pedido no ha cambiado."}</p>}
    </>}
    <p className="tracking-hint">Puedes explorar otros destinos sin cambiar la dirección guardada de tu pedido.</p>
  </section>;
}
