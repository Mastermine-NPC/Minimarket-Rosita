import { useImageSource } from "@/hooks/use-image-source";
import { useId, useEffect } from "react";
import { Package } from "lucide-react";
import type { Product } from "@/types/catalog";
export function ProductImage({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const uploaded = useImageSource(product.imageAssetId);
  if (product.imageAssetId) {
    if (uploaded.src)
      return (
        <div className={"product-image product-illustration " + className}>
          <img src={uploaded.src} alt={product.name} loading="lazy" decoding="async" width={320} height={320} />
        </div>
      );
    return (
      <div
        className={"product-image photo-placeholder " + className}
        role="img"
        aria-label={uploaded.error || "Preparando imagen de " + product.name}
      >
        <Package aria-hidden="true" />
        <span>
          {uploaded.error ? "Imagen no disponible" : "Preparando imagen…"}
        </span>
      </div>
    );
  }
  if (product.imageSrc)
    return (
      <div className={"product-image product-illustration " + className}>
        <img
          src={product.imageSrc.startsWith("/images/productos/modelos/") ? product.imageSrc + "?v=transparent-studio-1" : product.imageSrc}
          alt={
            (product.imageIsIllustration
              ? "Ilustración de demostración: "
              : "") + product.name
          }
          loading="lazy"
          decoding="async"
          width={320}
          height={320}
        />
        {product.imageIsIllustration && (
          <span>Ilustración · sin fotografía</span>
        )}
      </div>
    );
  if (product.imageIndex === undefined)
    return (
      <div
        className={"product-image photo-placeholder " + className}
        role="img"
        aria-label={"Fotografía pendiente de " + product.name}
      >
        <Package size={40} aria-hidden="true" />
        <span>Fotografía pendiente</span>
      </div>
    );
  const i = product.imageIndex;
  return (
    <div
      className={"product-image " + className}
      role="img"
      aria-label={product.name + " · " + product.presentation}
      style={{
        backgroundImage: "url(/images/productos-rosita-atlas.jpg)",
        backgroundSize: "300% 600%",
        backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 20}%`,
      }}
    >
      <span className="atlas-mask" aria-hidden="true" />
    </div>
  );
}

export interface ArtworkDimensions {
  width: number;
  height: number;
  vector: boolean;
}
/** Versión contain del mismo recurso; el viewBox recorta un solo artículo del atlas. */
export function ProductArtwork({
  product: originalProduct,
  onDimensions,
  onError,
}: {
  product: Product;
  onDimensions?: (size: ArtworkDimensions) => void;
  onError?: () => void;
}) {
  const clipId = useId();
  const uploaded = useImageSource(originalProduct.imageAssetId);
  const product = originalProduct.imageAssetId
    ? { ...originalProduct, imageSrc: uploaded.src }
    : originalProduct;
  useEffect(() => {
    if (uploaded.error) onError?.();
  }, [uploaded.error, onError]);
  // Un HTMLImageElement detecta también errores del atlas de forma fiable.
  // Los recursos SVG <image> no propagan onError de React igual en todos los motores.
  useEffect(() => {
    if (!onDimensions && !onError) return;
    const source =
      product.imageSrc ||
      (product.imageIndex === undefined
        ? null
        : "/images/productos-rosita-atlas.jpg");
    if (!source) return;
    const probe = new Image();
    probe.onload = () =>
      onDimensions?.(
        product.imageSrc
          ? {
              width: probe.naturalWidth,
              height: probe.naturalHeight,
              vector:
                !!product.imageIsIllustration &&
                product.imageSrc.endsWith(".svg"),
            }
          : { width: 300, height: 300, vector: false },
      );
    probe.onerror = () => onError?.();
    probe.src = source;
    return () => {
      probe.onload = null;
      probe.onerror = null;
    };
  }, [
    product.imageSrc,
    product.imageIndex,
    product.imageIsIllustration,
    onDimensions,
    onError,
  ]);
  if (product.imageAssetId && !product.imageSrc)
    return <span role="status">{uploaded.error || "Preparando imagen…"}</span>;
  if (product.imageSrc)
    return (
      <img
        className="product-artwork"
        src={product.imageSrc}
        alt={
          (product.imageIsIllustration ? "Ilustración de demostración: " : "") +
          product.name
        }
        draggable={false}
        onLoad={(event) =>
          onDimensions?.({
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight,
            vector:
              !!product.imageIsIllustration &&
              product.imageSrc!.endsWith(".svg"),
          })
        }
        onError={onError}
      />
    );
  if (product.imageIndex === undefined)
    return <ProductImage product={product} />;
  const x = (product.imageIndex % 3) * 300,
    y = Math.floor(product.imageIndex / 3) * 300;
  return (
    <svg
      className="product-artwork"
      viewBox={`${x} ${y} 300 300`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={product.name + " · " + product.presentation}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={300} height={300} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <image
          href="/images/productos-rosita-atlas.jpg"
          x={0}
          y={0}
          width={900}
          height={1800}
          onLoad={() =>
            onDimensions?.({ width: 300, height: 300, vector: false })
          }
          onError={onError}
        />
        <rect x={x + 240} y={y} width={60} height={57} fill="white" />
      </g>
    </svg>
  );
}
