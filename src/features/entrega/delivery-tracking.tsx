import { motionTokens } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useRosita } from "@/hooks/use-rosita";
import { RouteMap } from "./route-map";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/commerce";
export function DeliveryTracking({ order }: { order: Order }) {
  const { state, dispatch } = useRosita(),
    saved = state.tracking[order.id],
    [progress, Progress] = useState(saved?.progress || 0),
    [speed, Speed] = useState(saved?.speed || 1),
    [playing, Playing] = useState(false),
    reduced = useReducedMotion(),
    current = useRef({ progress, speed }),
    route = order.delivery.route,
    origin = order.delivery.origin,
    pickup = order.delivery.mode === "pickup",
    canPlay = order.status === 2 && !pickup && !!route;
  useEffect(() => {
    current.current = { progress, speed };
  }, [progress, speed]);
  useEffect(() => {
    const save = () =>
      dispatch({ type: "tracking/save", id: order.id, ...current.current });
    const timer = setInterval(save, 5000),
      hidden = () => {
        if (document.hidden) {
          Playing(false);
          save();
        }
      };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hidden);
      save();
    };
  }, [dispatch, order.id]);
  useEffect(() => {
    if (!playing || !canPlay || reduced) return;
    let frame = 0,
      last = 0;
    const tick = (now: number) => {
      const elapsed = last ? Math.min(now - last, 1000) : 0;
      last = now;
      const next = Math.min(
        1,
        current.current.progress +
          (elapsed / (motionTokens.riderSimulationSeconds * 1000)) *
            current.current.speed,
      );
      current.current.progress = next;
      Progress(next);
      if (next < 1) frame = requestAnimationFrame(tick);
      else {
        Playing(false);
        dispatch({ type: "tracking/save", id: order.id, ...current.current });
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, canPlay, reduced, dispatch, order.id]);
  if (!origin)
    return (
      <p className="hint">
        Pedido anterior sin coordenadas guardadas. No se reconstruye una ruta ni
        se inventa su origen.
      </p>
    );
  return (
    <section className="delivery-tracking">
      <h3>{pickup ? "Recojo en Rosita" : "Recorrido de demostración"}</h3>
      <RouteMap
        origin={origin}
        destination={pickup ? undefined : order.delivery.point}
        route={pickup ? undefined : route}
        progress={progress}
        showRider={!pickup && !!route && order.status >= 2}
      />
      {pickup ? (
        <p>
          Recojo en tienda · envío cero. No hay ruta de reparto. La recogida se
          confirma mediante el avance de estado.
        </p>
      ) : (
        <>
          <p>
            <strong>
              Recorrido simulado sobre mapa real. No es ubicación GPS en vivo
            </strong>
          </p>
          {route ? (
            <>
              <p>
                {(route.distance / 1000).toFixed(2)} km ·{" "}
                {Math.round(route.duration / 60)} min estimados por{" "}
                {route.provider}. Sin tráfico en vivo.
                {route.fallback ? " Ruta verificada guardada." : ""}
              </p>
              <label htmlFor="route-progress">
                Progreso simulado: {Math.round(progress * 100)}%
              </label>
              <progress id="route-progress" max={1} value={progress} />
              <p>
                Tiempo restante de animación:{" "}
                {Math.ceil(
                  ((1 - progress) * motionTokens.riderSimulationSeconds) /
                    speed,
                )}{" "}
                s. A 1×, todo el recorrido dura 120 s; no equivale al tiempo
                real del viaje.
              </p>
              <div className="customer-actions">
                <Button
                  disabled={!canPlay || progress >= 1 || !!reduced}
                  aria-describedby="rider-help"
                  onClick={() => {
                    if (playing) {
                      Playing(false);
                      dispatch({
                        type: "tracking/save",
                        id: order.id,
                        progress,
                        speed,
                      });
                    } else Playing(true);
                  }}
                >
                  {playing
                    ? "Pausar"
                    : progress > 0
                      ? "Reanudar simulación"
                      : "Iniciar simulación"}
                </Button>
                {reduced && (
                  <Button
                    disabled={!canPlay || progress >= 1}
                    onClick={() => {
                      const next = Math.min(1, progress + 0.1);
                      Progress(next);
                      dispatch({
                        type: "tracking/save",
                        id: order.id,
                        progress: next,
                        speed,
                      });
                    }}
                  >
                    Avanzar 10% sin animación
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    Playing(false);
                    Progress(0);
                    dispatch({
                      type: "tracking/save",
                      id: order.id,
                      progress: 0,
                      speed,
                    });
                  }}
                >
                  Restablecer recorrido visual
                </Button>
              </div>
              <label htmlFor="rider-speed">Velocidad de demostración</label>
              <select
                id="rider-speed"
                value={speed}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  Speed(value);
                  dispatch({
                    type: "tracking/save",
                    id: order.id,
                    progress,
                    speed: value,
                  });
                }}
              >
                {[1, 2, 4, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}×
                  </option>
                ))}
              </select>
              <p className="hint" id="rider-help">
                {reduced
                  ? "Movimiento reducido: usa los avances manuales. "
                  : ""}
                {!canPlay
                  ? "Se inicia únicamente en el estado «En camino». "
                  : ""}
                Al recargar se recupera el progreso en pausa. Llegar al final
                del mapa no confirma la entrega ni descuenta inventario.
              </p>
              {progress >= 1 && (
                <p role="status">
                  ✓ Recorrido simulado completado. Confirma la entrega con el
                  control de estado cuando corresponda.
                </p>
              )}
            </>
          ) : (
            <p>
              Este pedido no incluye una ruta vial guardada. No se muestra una
              línea recta como recorrido.
            </p>
          )}
        </>
      )}
    </section>
  );
}
