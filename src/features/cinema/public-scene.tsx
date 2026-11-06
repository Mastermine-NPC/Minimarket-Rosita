import { useRef, useLayoutEffect } from "react";
import { ArrowDown } from "lucide-react";
import gsap from "gsap";
import { AmbientVideo } from "@/features/inicio/ambient-video";
import { useMotionPreference } from "@/hooks/use-motion-preference";
const scenes: Record<string, { film: string; title: string; copy: string }> = {
  catalogo: { film: "oreo-coca-cola-video-cinematografic", title: "Un mundo por elegir.", copy: "Tus favoritos y algo nuevo. Todo en Rosita." },
  consumibles: { film: "coca-cola-video-cinematografic", title: "Los planes saben mejor.", copy: "Bebidas, snacks y lo que acompaña tu día." },
  ferreteria: { film: "tornillos-video-cinematografic", title: "Dale forma a tus planes.", copy: "Pequeñas soluciones, nuevos proyectos." },
  "educacion-oficina": { film: "faber-castell-video-cinematografic", title: "Todo empieza con una idea.", copy: "Un trazo. Un color. Un mundo de posibilidades." },
  "cuidado-personal": { film: "nivea-video-cinematografic", title: "Tu momento importa.", copy: "Encuentra lo que necesitas para cuidarte." },
  tecnologia: { film: "audio-watch-bag-video-cinematografic", title: "Conecta con tu día.", copy: "Accesorios para lo que viene." },
  jugueteria: { film: "artesco-video-cinematografic", title: "Tiempo de imaginar.", copy: "Haz espacio para jugar y crear." },
  nosotros: { film: "Arequipa-backgraound-02", title: "De aquí. Para ti.", copy: "Rosita y la cercanía de todos los días." },
  contacto: { film: "Arequipa-backgraound-02", title: "Siempre cerca.", copy: "Conversemos. Estamos para acompañarte." },
  ayuda: { film: "video-intro", title: "Compra a tu ritmo.", copy: "Todo claro, desde la elección hasta tu pedido." },
};
export function PublicScene({ pathname }: { pathname: string }) {
  const key = pathname.startsWith("/categoria/") ? pathname.split("/")[2] : pathname.slice(1);
  const scene = scenes[key];
  const root = useRef<HTMLElement>(null);
  const reduced = useMotionPreference();
  useLayoutEffect(() => {
    if (!scene || reduced || !root.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(".public-scene-camera", { scale: 1.15, yPercent: -6 }, { scale: 1, yPercent: 8, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 } });
      gsap.from(".public-scene-title span", { yPercent: 110, rotation: 3, stagger: 0.07, duration: 1, ease: "power3.out" });
    }, root);
    return () => context.revert();
  }, [scene, reduced]);
  if (!scene) return null;
  const prefix = scene.film === "video-intro" ? "/images/video/web/" : "/images/video/cinematic/";
  return <section ref={root} className="public-scene" aria-label={scene.title}>
    <div className="public-scene-visual" aria-hidden="true">
      <div className="public-scene-camera"><AmbientVideo src={`${prefix}${scene.film}.mp4`} poster={`${prefix}${scene.film}${scene.film === "video-intro" ? "-poster" : ""}.jpg`} label={scene.title} loop priority /></div>
      <div className="cinema-scene-shade" />
    </div>
    <div className="public-scene-copy"><p className="public-scene-title"><span className="sr-only">{scene.title}</span>{scene.title.split(" ").map((word, index) => <span className="cinema-word-mask" key={index} aria-hidden="true"><span>{word}</span></span>)}</p><p>{scene.copy}</p>
      <button onClick={() => document.querySelector(".public-page-body")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" })}>Seguir explorando <ArrowDown aria-hidden="true" /></button>
    </div>
  </section>;
}
