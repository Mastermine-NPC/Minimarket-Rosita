import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type CSSProperties,
} from "react";
import { Expand, Minus, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { ProductArtwork, type ArtworkDimensions } from "./product-image";
import { clamp, imagePoint, panBounds } from "./zoom-geometry";
import type { Product } from "@/types/catalog";
import "@/styles/product-zoom.css";
const maximumUpscale = (dimensions: ArtworkDimensions) =>
  dimensions.vector ? Infinity : 1.25;
const artworkStyle = (dimensions: ArtworkDimensions) =>
  ({
    "--artwork-max-width": dimensions.vector
      ? "100%"
      : `${dimensions.width * 1.25}px`,
    "--artwork-max-height": dimensions.vector
      ? "100%"
      : `${dimensions.height * 1.25}px`,
  }) as CSSProperties;

export function ProductImageZoom({ product }: { product: Product }) {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)"),
    reduced = useMotionPreference();
  const [open, setOpen] = useState(false),
    [failed, setFailed] = useState(false),
    [dimensions, setDimensions] = useState<ArtworkDimensions>({
      width: 300,
      height: 300,
      vector: false,
    });
  const trigger = useRef<HTMLElement | null>(null),
    image = useRef<HTMLDivElement>(null),
    close = useRef<HTMLButtonElement>(null);
  const available =
    !failed &&
    (!!product.imageAssetId ||
      !!product.imageSrc ||
      product.imageIndex !== undefined);
  const maximum = dimensions.vector
    ? 3
    : Math.max(dimensions.width, dimensions.height) >= 1600
      ? 3
      : Math.max(dimensions.width, dimensions.height) >= 800
        ? 2
        : 1.5;
  const report = useCallback(
    (next: ArtworkDimensions) =>
      setDimensions((old) =>
        old.width === next.width &&
        old.height === next.height &&
        old.vector === next.vector
          ? old
          : next,
      ),
    [],
  );
  const error = useCallback(() => setFailed(true), []);
  const resetHover = () => {
    if (image.current) {
      image.current.style.transform = "none";
      image.current.dataset.zoomed = "false";
    }
  };
  const show = (element: HTMLElement) => {
    resetHover();
    trigger.current = element;
    setOpen(true);
  };
  const note = failed
    ? "La imagen no está disponible."
    : product.imageIsIllustration
      ? "Ilustración vectorial de demostración; fotografía pendiente."
      : available
        ? `Fuente: ${dimensions.width} × ${dimensions.height} px. Ampliación limitada; no añade detalle.`
        : "Fotografía pendiente. No hay imagen para ampliar.";
  return (
    <div className="product-zoom native-selection">
      <button
        type="button"
        className="product-zoom-open"
        disabled={!available}
        aria-label={"Ampliar imagen de " + product.name}
        onClick={(event) => show(event.currentTarget)}
        onPointerLeave={resetHover}
        onBlur={resetHover}
        onPointerMove={(event) => {
          if (
            !fine ||
            reduced ||
            open ||
            !available ||
            event.pointerType !== "mouse"
          )
            return;
          const rect = event.currentTarget.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top;
          const point = imagePoint(
            x,
            y,
            rect.width,
            rect.height,
            dimensions.width,
            dimensions.height,
            maximumUpscale(dimensions),
          );
          if (!point) {
            resetHover();
            return;
          }
          if (image.current) {
            image.current.style.transformOrigin = `${x}px ${y}px`;
            image.current.style.transform = `scale(${Math.min(maximum, 1.5)})`;
            image.current.dataset.zoomed = "true";
            image.current.dataset.point = `${point.x.toFixed(3)},${point.y.toFixed(3)}`;
          }
        }}
      >
        <div
          className="product-zoom-artwork"
          ref={image}
          style={artworkStyle(dimensions)}
        >
          {failed ? (
            <span>Imagen no disponible</span>
          ) : (
            <ProductArtwork
              product={product}
              onDimensions={report}
              onError={error}
            />
          )}
        </div>
      </button>
      <Button
        type="button"
        variant="outline"
        className="product-zoom-trigger"
        disabled={!available}
        onClick={(event) => show(event.currentTarget)}
      >
        <Expand size={17} aria-hidden="true" />
        Ampliar imagen
      </Button>
      <p className="product-zoom-note">{note}</p>
      {available && (
        <p className="product-zoom-hint">
          {fine && !reduced
            ? "Pasa el cursor sobre la imagen para explorar. Clic para abrir."
            : "Toca la imagen o usa Ampliar imagen."}
        </p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="product-zoom-dialog native-selection"
          showCloseButton={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            close.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (trigger.current?.isConnected)
              trigger.current.focus({ preventScroll: true });
          }}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <div className="product-zoom-heading">
            <DialogTitle>{product.name}</DialogTitle>
            <DialogClose asChild>
              <Button ref={close} variant="outline">
                <X size={18} aria-hidden="true" />
                Cerrar
              </Button>
            </DialogClose>
          </div>
          <DialogDescription>
            {product.presentation}. {note}
          </DialogDescription>
          {open &&
            (failed ? (
              <p role="status">No se puede ampliar esta imagen.</p>
            ) : (
              <ZoomCanvas
                product={product}
                dimensions={dimensions}
                maximum={maximum}
                onError={error}
              />
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function ZoomCanvas({
  product,
  dimensions,
  maximum,
  onError,
}: {
  product: Product;
  dimensions: ArtworkDimensions;
  maximum: number;
  onError: () => void;
}) {
  const [scale, setScale] = useState(1),
    stage = useRef<HTMLDivElement>(null),
    artwork = useRef<HTMLDivElement>(null),
    position = useRef({ x: 0, y: 0 }),
    drag = useRef<{
      id: number;
      x: number;
      y: number;
      left: number;
      top: number;
    } | null>(null);
  const draw = useCallback(() => {
    const root = stage.current;
    if (!root) return;
    const bounds = panBounds(
      root.clientWidth,
      root.clientHeight,
      dimensions.width,
      dimensions.height,
      scale,
      maximumUpscale(dimensions),
    );
    position.current = {
      x: clamp(position.current.x, bounds.x),
      y: clamp(position.current.y, bounds.y),
    };
    if (artwork.current)
      artwork.current.style.transform = `translate(${position.current.x}px,${position.current.y}px) scale(${scale})`;
    root.dataset.pan = `${position.current.x.toFixed(1)},${position.current.y.toFixed(1)}`;
  }, [dimensions, scale]);
  useLayoutEffect(() => {
    const root = stage.current;
    if (!root) return;
    draw();
    const resize = new ResizeObserver(draw);
    resize.observe(root);
    return () => resize.disconnect();
  }, [draw]);
  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "false";
  };
  return (
    <>
      <div className="product-zoom-tools" aria-label="Controles de imagen">
        <Button
          variant="outline"
          disabled={scale >= maximum}
          title={
            scale >= maximum
              ? "Máxima ampliación disponible para esta fuente"
              : "Acercar imagen"
          }
          onClick={() => setScale((old) => Math.min(maximum, old + 0.25))}
        >
          <Plus size={18} aria-hidden="true" />
          Acercar
        </Button>
        <Button
          variant="outline"
          disabled={scale <= 1}
          onClick={() => setScale((old) => Math.max(1, old - 0.25))}
        >
          <Minus size={18} aria-hidden="true" />
          Alejar
        </Button>
        <Button
          variant="outline"
          disabled={scale === 1}
          onClick={() => {
            position.current = { x: 0, y: 0 };
            setScale(1);
          }}
        >
          <RotateCcw size={18} aria-hidden="true" />
          Restablecer
        </Button>
        <output role="status" aria-live="polite">
          {Math.round(scale * 100)} %
        </output>
      </div>
      <div
        className="product-zoom-canvas"
        ref={stage}
        tabIndex={0}
        role="region"
        aria-label="Imagen ampliada. Usa flechas para desplazar y los controles para acercar o alejar."
        data-scale={scale}
        style={{ touchAction: scale > 1 ? "pinch-zoom" : "auto" }}
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (scale <= 1 || event.button !== 0) return;
          if (drag.current) {
            const id = drag.current.id;
            drag.current = null;
            if (event.currentTarget.hasPointerCapture(id))
              event.currentTarget.releasePointerCapture(id);
            return;
          }
          drag.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            left: position.current.x,
            top: position.current.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.dataset.dragging = "true";
        }}
        onPointerMove={(event) => {
          const d = drag.current;
          if (!d || d.id !== event.pointerId) return;
          position.current = {
            x: d.left + event.clientX - d.x,
            y: d.top + event.clientY - d.y,
          };
          draw();
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={() => {
          drag.current = null;
          if (stage.current) stage.current.dataset.dragging = "false";
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const delta: Record<string, [number, number]> = {
            ArrowLeft: [40, 0],
            ArrowRight: [-40, 0],
            ArrowUp: [0, 40],
            ArrowDown: [0, -40],
          };
          if (delta[event.key]) {
            event.preventDefault();
            position.current = {
              x: position.current.x + delta[event.key][0],
              y: position.current.y + delta[event.key][1],
            };
            draw();
          }
          if (event.key === "Home") {
            event.preventDefault();
            position.current = { x: 0, y: 0 };
            setScale(1);
            draw();
          }
        }}
      >
        <div
          ref={artwork}
          className="product-zoom-artwork"
          style={artworkStyle(dimensions)}
        >
          <ProductArtwork product={product} onError={onError} />
        </div>
      </div>
      <p className="product-zoom-help">
        Acerca para desplazar con arrastre o flechas. La pinza y el zoom del
        navegador siguen disponibles. Cierra con Escape o Cerrar.
      </p>
    </>
  );
}
