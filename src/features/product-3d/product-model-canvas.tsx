import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import { ACESFilmicToneMapping, Group, Vector2, type Object3D, type PerspectiveCamera } from "three";
import gsap from "gsap";
import { RotateCcw, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { ShaderBackdrop } from "./shader-backdrop";
import { disposeModel, limitModelTextures, prepareModel } from "./model-resources";
import type { ProductModelConfig } from "./types";

type Props = { config: ProductModelConfig; active: boolean; reduced: boolean; onFailure: () => void };
function StudioShadow({ config, reduced }: Pick<Props, "config" | "reduced">) {
  const [settled, setSettled] = useState(reduced);
  const { invalidate } = useThree();
  useEffect(() => {
    // Bake once after the entrance, rather than render a shadow map on every frame.
    const timer = window.setTimeout(() => { setSettled(true); invalidate(); }, reduced ? 0 : config.animation.duration * 1000 + 100);
    return () => window.clearTimeout(timer);
  }, [config, reduced, invalidate]);
  return settled ? <ContactShadows position={[0, -config.model.height / 2 - 0.04, 0]} opacity={0.4} scale={10} blur={2.8} far={5} resolution={256} frames={1} color="#000000" /> : null;
}
function Model({ config, reduced, pointer, scroll, onReady, onFailure, introRef }: Props & { pointer: Vector2; scroll: { current: number }; onReady: () => void; introRef: RefObject<gsap.core.Timeline | null> }) {
  const [model, setModel] = useState<{ scene: Object3D; scale: number } | null>(null);
  const entry = useRef<Group>(null);
  const parallax = useRef<Group>(null);
  const { camera, gl, invalidate } = useThree();
  useEffect(() => {
    if (!config.modelUrl) return;
    let alive = true;
    let loading = true;
    let owned: Object3D | undefined;
    const release = () => { if (owned) { disposeModel(owned); owned = undefined; } };
    const abort = new AbortController();
    void (async () => {
      const response = await fetch(config.modelUrl!, { signal: abort.signal });
      if (!response.ok) throw new Error("Modelo no disponible");
      const buffer = await response.arrayBuffer();
      const url = new URL(config.modelUrl!, location.href);
      const gltf = await new GLTFLoader().parseAsync(buffer, new URL(".", url).href);
      owned = gltf.scene;
      if (!alive) return;
      await limitModelTextures(gltf.scene, innerWidth < 900 ? 1024 : 2048);
      if (!alive) return;
      const scale = prepareModel(gltf.scene, config.model, Math.min(4, gl.capabilities.getMaxAnisotropy()));
      setModel({ scene: gltf.scene, scale });
      onReady(); invalidate();
    })().catch(error => { if (alive && error?.name !== "AbortError") {
      console.warn("No se pudo preparar el modelo 3D", error);
      onFailure();
    } }).finally(() => { loading = false; if (!alive) release(); });
    return () => { alive = false; abort.abort(); if (!loading) release(); };
  }, [config, gl, invalidate, onReady, onFailure]);
  useLayoutEffect(() => {
    if (!model || reduced || !entry.current) return;
    const perspective = camera as PerspectiveCamera;
    const target = config.camera.position;
    perspective.position.set(target[0], target[1], target[2] + config.animation.cameraTravel);
    const animation = gsap.timeline({ onUpdate: invalidate });
    introRef.current = animation;
    animation.fromTo(entry.current.position, { y: -config.animation.modelTravel }, { y: 0, duration: config.animation.duration, ease: "power3.out" }, 0)
      .fromTo(entry.current.rotation, { y: -0.4 }, { y: 0, duration: config.animation.duration, ease: "power3.out" }, 0)
      .to(perspective.position, { x: target[0], y: target[1], z: target[2], duration: config.animation.duration, ease: "power3.out" }, 0);
    return () => { animation.kill(); if (introRef.current === animation) introRef.current = null; };
  }, [model, reduced, config, camera, invalidate, introRef]);
  useFrame(() => {
    if (!parallax.current) return;
    const strength = reduced ? 0 : config.background.parallax;
    parallax.current.position.x += (pointer.x * strength - parallax.current.position.x) * 0.06;
    parallax.current.position.y += (pointer.y * strength * 0.5 + (reduced ? 0 : scroll.current * 0.08) - parallax.current.position.y) * 0.06;
  });
  return model ? <group ref={entry}><group ref={parallax}><group scale={model.scale} rotation={config.model.rotation} position={config.model.position}><primitive object={model.scene} dispose={null} /></group></group></group> : null;
}
function RenderBudget({ active, reduced, onFailure }: Pick<Props, "active" | "reduced" | "onFailure">) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  useEffect(() => {
    if (!active || reduced) { invalidate(); return; }
    let frame = 0, previous = 0;
    const tick = (time: number) => {
      if (document.hidden) { frame = 0; return; }
      if (time - previous >= 1000 / 30) { previous = time; invalidate(); }
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else if (!frame) { previous = 0; frame = requestAnimationFrame(tick); }
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", visibility); };
  }, [active, reduced, invalidate]);
  return null;
}
export default function ProductModelCanvas({ config, active, reduced, onFailure }: Props) {
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const helpId = useId();
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const controls = useRef<OrbitControlsType>(null);
  const pointer = useMemo(() => new Vector2(), []);
  const scroll = useRef(0);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const reportReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    const update = () => {
      if (root.current) scroll.current = Math.max(-1, Math.min(1, (innerHeight * 0.5 - root.current.getBoundingClientRect().top) / innerHeight));
    };
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  function rotate(horizontal: number, vertical = 0) {
    const orbit = controls.current;
    if (!orbit) return;
    introRef.current?.kill();
    orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() + horizontal);
    orbit.setPolarAngle(Math.max(config.camera.minPolarAngle, Math.min(config.camera.maxPolarAngle, orbit.getPolarAngle() + vertical)));
    orbit.update();
  }
  function zoom(inward: boolean) { const orbit = controls.current; if (!orbit) return; introRef.current?.kill(); if (inward) orbit.dollyIn(1.2); else orbit.dollyOut(1.2); orbit.update(); }
  function reset() {
    const orbit = controls.current;
    if (!orbit) return;
    introRef.current?.kill();
    orbit.target.set(0, 0, 0);
    orbit.object.position.set(...config.camera.position);
    orbit.update(); pointer.set(0, 0);
  }
  return <div className="product-3d-engine" ref={root} data-model-state={ready ? "ready" : "loading"}>
    <div className="product-3d-canvas" tabIndex={0} role="group" aria-label={`Visor 3D de ${config.label}`} aria-describedby={helpId}
      onPointerMove={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
        if (cursor.current) cursor.current.style.transform = `translate(${event.clientX - rect.left}px, ${event.clientY - rect.top}px)`;
      }} onPointerLeave={() => pointer.set(0, 0)}
      onKeyDown={event => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "-", "Home"].includes(event.key)) event.preventDefault();
        if (event.key === "ArrowLeft") rotate(-0.2); if (event.key === "ArrowRight") rotate(0.2);
        if (event.key === "ArrowUp") rotate(0, -0.15); if (event.key === "ArrowDown") rotate(0, 0.15);
        if (event.key === "+") zoom(true); if (event.key === "-") zoom(false); if (event.key === "Home") reset();
      }}>
      <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: config.camera.position, fov: config.camera.fov, near: 0.05, far: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: "low-power", toneMapping: ACESFilmicToneMapping }} onCreated={({ gl }) => { gl.toneMappingExposure = config.lighting.exposure; }} fallback={<p>WebGL no disponible. Consulta la fotografía del producto.</p>}>
        <RenderBudget active={active} reduced={reduced} onFailure={onFailure} />
        <ShaderBackdrop config={config.background} reduced={reduced} pointer={pointer} />
        <ambientLight intensity={config.lighting.ambient * 0.45} />
        <directionalLight position={[3, 6, 5]} intensity={config.lighting.key * 0.25} />
        <spotLight position={[-4, 3, -3]} intensity={config.lighting.rim * 2} angle={0.65} penumbra={1} color="#ffffff" />
        <Environment resolution={128} frames={1}>
          {/* Broad studio panels: readable labels and long, soft reflections on packaging. */}
          <Lightformer intensity={config.lighting.fill ?? 1.5} position={[0, 1, 5]} scale={[5, 4, 1]} />
          <Lightformer intensity={3} position={[4, 2, 3]} scale={[2, 5, 1]} />
          <Lightformer intensity={2} position={[-4, 1, 2]} scale={[1.5, 4, 1]} />
          <Lightformer intensity={2.5} position={[0, 5, 0]} scale={[4, 3, 1]} />
        </Environment>
        {ready && <StudioShadow config={config} reduced={reduced} />}
        <Model config={config} active={active} reduced={reduced} onFailure={onFailure} onReady={reportReady} introRef={introRef} pointer={pointer} scroll={scroll} />
        <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping={!reduced} dampingFactor={config.interaction.damping} rotateSpeed={config.interaction.rotateSpeed} zoomSpeed={config.interaction.zoomSpeed} minDistance={config.camera.minDistance} maxDistance={config.camera.maxDistance} minPolarAngle={config.camera.minPolarAngle} maxPolarAngle={config.camera.maxPolarAngle} onStart={() => { introRef.current?.kill(); setDragging(true); }} onEnd={() => setDragging(false)} />
      </Canvas>
      {!ready && <p className="product-3d-loading" role="status">Cargando modelo 3D…</p>}
      {!reduced && <span ref={cursor} className="product-3d-cursor" aria-hidden="true">{dragging ? "Girando" : "Arrastrar"}</span>}
    </div>
    <div className="product-3d-tools" role="group" aria-label="Controles del modelo">
      <button disabled={!ready} onClick={() => rotate(-0.25)} aria-label="Girar a la izquierda"><ArrowLeft /></button>
      <button disabled={!ready} onClick={() => rotate(0.25)} aria-label="Girar a la derecha"><ArrowRight /></button>
      <button disabled={!ready} onClick={() => rotate(0, -0.2)} aria-label="Inclinar hacia arriba"><ArrowUp /></button>
      <button disabled={!ready} onClick={() => rotate(0, 0.2)} aria-label="Inclinar hacia abajo"><ArrowDown /></button>
      <button disabled={!ready} onClick={() => zoom(true)} aria-label="Acercar modelo"><ZoomIn /></button>
      <button disabled={!ready} onClick={() => zoom(false)} aria-label="Alejar modelo"><ZoomOut /></button>
      <button disabled={!ready} onClick={reset}><RotateCcw /> Restablecer</button>
    </div>
    <p id={helpId} className="product-3d-help">Arrastra para girar. Rueda o gesto de pinza para acercar. También puedes usar las flechas, +, − e Inicio con el visor enfocado.</p>
  </div>;
}
