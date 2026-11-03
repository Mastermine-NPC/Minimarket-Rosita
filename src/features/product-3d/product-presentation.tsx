import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import type { ProductModelConfig } from "./types";
import "@/styles/product-3d.css";
const ProductModelCanvas = lazy(() => import("./product-model-canvas"));
class ViewerBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function ProductPresentation({ config, fallback, brand, presentation }: {
  config: ProductModelConfig; fallback: ReactNode; brand: string; presentation: string;
}) {
  const root = useRef<HTMLElement>(null);
  const reduced = useMotionPreference();
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [retry, setRetry] = useState(0);
  const [failure, setFailure] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: "80px" });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const reportFailure = useCallback(() => setFailure(true), []);
  const photo = <div className="product-3d-fallback">{fallback}<p role="status">{config.modelUrl ? "El visor no está disponible. Puedes consultar la imagen del producto y continuar con la compra." : config.fallbackMessage}</p></div>;
  return <section ref={root} className="product-3d-presentation" aria-label={`Presentación de ${config.label}`} data-lenis-prevent data-viewer-mode={config.modelUrl ? "3d" : "photograph"}>
    <div className="product-3d-presentation-heading"><span>{brand}</span><span>{presentation}</span></div>
    <div className="product-3d-content">
    {config.modelUrl && !failure ? near ? <ViewerBoundary key={retry} fallback={photo}>
      <Suspense fallback={<div className="product-3d-loading" role="status">Preparando vista 3D…</div>}>
        <ProductModelCanvas config={config} active={visible} reduced={reduced} onFailure={reportFailure} />
      </Suspense>
    </ViewerBoundary> : <div className="product-3d-loading" role="status">Preparando vista 3D…</div> : photo}
    </div>
    {failure && config.modelUrl && <button className="product-3d-retry" onClick={() => { setFailure(false); setRetry(value => value + 1); }}>Reintentar vista 3D</button>}
    {config.modelUrl && config.attribution && <p className="product-model-credit"><a href={config.attribution.url} target="_blank" rel="noreferrer">Modelo: {config.attribution.author}</a> · <a href={config.attribution.licenseUrl} target="_blank" rel="noreferrer">{config.attribution.license}</a></p>}
  </section>;
}
