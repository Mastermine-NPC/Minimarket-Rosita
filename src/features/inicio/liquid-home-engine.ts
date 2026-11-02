import { liquidFragment, liquidVertex, liquidReveal } from "./liquid-shaders";

type Source = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
type Plane = {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  sources: Source[];
  kind: "pair" | "media" | "background";
  owned: boolean;
  failed: boolean;
};

/** One WebGL context/RAF for the Home. DOM media keep ownership of playback. */
export function createLiquidHome(root: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const device = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const light = !fine.matches || !!device.connection?.saveData || (device.deviceMemory ?? 8) <= 2;
  const renderer = document.createElement("canvas");
  const gl = !device.connection?.saveData && (device.deviceMemory ?? 8) > 2
    ? renderer.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power", premultipliedAlpha: false }) : null;
  const planes: Plane[] = [];
  const scenes = [...root.querySelectorAll<HTMLElement>(".cinema-scene")];
  const textures: WebGLTexture[] = [], shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null;
  let failed = !gl, frame = 0, last = 0, lastMove = 0, scrollAt = 0, scrollY = window.scrollY;
  let staticPainted = false;
  const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  let alive = true;
  const atlas = new Image();
  const atlasTiles: { canvas: HTMLCanvasElement; x: number; y: number }[] = [];
  const pair = root.querySelector<HTMLElement>(".liquid-videos");
  const pairPosters = new Map<HTMLVideoElement, HTMLImageElement>();
  pair?.querySelectorAll("video").forEach(video => {
    const poster = video.parentElement?.querySelector<HTMLImageElement>(":scope > img");
    if (poster) pairPosters.set(video, poster);
  });

  function add(host: HTMLElement, sources: Source[], kind: Plane["kind"], existing?: HTMLCanvasElement) {
    const canvas = existing || document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    if (!existing) {
      canvas.className = kind === "background" ? "liquid-background-plane" : "liquid-media-plane";
      canvas.setAttribute("aria-hidden", "true");
      host.append(canvas);
    }
    planes.push({ host, canvas, context, sources, kind, owned: !existing, failed: false });
  }
  if (pair) add(pair, [...pair.querySelectorAll("video")], "pair", pair.querySelector("canvas")!);
  root.querySelectorAll<HTMLElement>(".cinema-scene .ambient-video").forEach(host => add(host, [...host.querySelectorAll("video")], "media"));
  root.querySelectorAll<HTMLImageElement>(".home-category-media > img").forEach(image => add(image.parentElement!, [image], "media"));
  root.querySelectorAll<HTMLImageElement>(".product-image > img").forEach(image => add(image.parentElement!, [image], "media"));
  root.querySelectorAll<HTMLElement>(".product-image[style]").forEach(host => {
    if (!host.style.backgroundImage.includes("productos-rosita-atlas")) return;
    const [x, y] = host.style.backgroundPosition.split(" ").map(value => parseFloat(value));
    const tile = document.createElement("canvas"); tile.width = 0; tile.height = 0;
    atlasTiles.push({ canvas: tile, x: Math.round(x / 50), y: Math.round(y / 20) });
    add(host, [tile], "media");
  });
  atlas.onload = () => {
    if (!alive) return;
    for (const tile of atlasTiles) {
      tile.canvas.width = 300; tile.canvas.height = 300;
      const context = tile.canvas.getContext("2d")!;
      context.drawImage(atlas, tile.x * 300, tile.y * 300, 300, 300, 0, 0, 300, 300);
      context.fillStyle = "white"; context.fillRect(240, 0, 60, 57);
    }
  };
  if (atlasTiles.length) atlas.src = "/images/productos-rosita-atlas.jpg";
  root.querySelectorAll<HTMLElement>("section").forEach(section => {
    section.classList.add("liquid-section");
    if (!section.closest(".liquid-videos")) add(section, [], "background");
  });

  function restore() {
    root.dataset.liquidEngine = "fallback";
    if (pair) pair.dataset.liquid = "fallback";
    for (const plane of planes) {
      plane.host.removeAttribute("data-liquid-surface");
      plane.canvas.style.visibility = "hidden";
    }
  }
  try {
    if (gl) {
      program = gl.createProgram();
      for (const [type, source] of [[gl.VERTEX_SHADER, liquidVertex], [gl.FRAGMENT_SHADER, liquidFragment]] as const) {
        const shader = gl.createShader(type)!;
        shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Liquid shader unavailable");
        gl.attachShader(program!, shader);
      }
      gl.linkProgram(program!);
      if (!gl.getProgramParameter(program!, gl.LINK_STATUS)) throw new Error("Liquid compositor unavailable");
      gl.useProgram(program);
      buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program!, "position");
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      for (const name of ["size", "firstSize", "secondSize", "tilt", "seam", "time", "pair", "background", "lightweight", "transition", "fit"]) uniforms[name] = gl.getUniformLocation(program!, name);
      for (let i = 0; i < 2; i++) {
        const texture = gl.createTexture()!; textures.push(texture);
        gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
        gl.uniform1i(gl.getUniformLocation(program!, i ? "secondFilm" : "firstFilm"), i);
      }
    }
  } catch { failed = true; }
  restore();

  function ready(source: Source) {
    if (source instanceof HTMLCanvasElement) return source.width > 0 && source.height > 0;
    return source instanceof HTMLVideoElement ? source.readyState >= 2 && source.videoWidth > 0 && !source.error : source.complete && source.naturalWidth > 0;
  }
  function dimensions(source: Source) {
    if (source instanceof HTMLCanvasElement) return [source.width, source.height];
    return source instanceof HTMLVideoElement ? [source.videoWidth, source.videoHeight] : [source.naturalWidth, source.naturalHeight];
  }
  function renderPlane(plane: Plane, now: number, boost: number) {
    if (!gl || !program || plane.failed) return;
    const rect = plane.host.getBoundingClientRect();
    if (rect.bottom < -24 || rect.top > innerHeight + 24 || rect.right < 0 || rect.left > innerWidth || rect.width < 1 || rect.height < 1) return;
    const scene = plane.host.closest<HTMLElement>(".cinema-scene");
    if (scene?.parentElement?.classList.contains("is-pinned")) {
      const index = scenes.indexOf(scene);
      if (Number(scene.dataset.liquidProgress ?? 1) <= 0) return;
      const next = scenes[index + 1];
      if (next && Number(next.dataset.liquidProgress ?? 0) >= 1) return;
    }
    const layer = plane.host.closest(".cinema-film-layer");
    if (layer && !layer.classList.contains("is-selected") && !layer.classList.contains("is-liquid-outgoing")) return;
    // The shared surface samples the existing poster until its video has painted.
    // Switching textures in the same draw keeps the boundary and shading continuous.
    const sources = plane.kind === "pair" ? plane.sources.map(source => {
      if (!(source instanceof HTMLVideoElement)) return source;
      return ready(source) && source.classList.contains("is-playing")
        ? source : pairPosters.get(source) || source;
    }) : plane.sources;
    if (sources.length && !sources.every(ready)) {
      plane.host.removeAttribute("data-liquid-surface");
      plane.canvas.style.visibility = "hidden";
      if (plane.kind === "pair") plane.host.dataset.liquid = "fallback";
      return;
    }
    const logicalWidth = plane.host.clientWidth, logicalHeight = plane.host.clientHeight;
    const ratio = Math.min(devicePixelRatio, light ? .85 : 1.25, 2048 / Math.max(logicalWidth, logicalHeight));
    const width = Math.max(1, Math.round(logicalWidth * ratio)), height = Math.max(1, Math.round(logicalHeight * ratio));
    if (renderer.width !== width || renderer.height !== height) { renderer.width = width; renderer.height = height; }
    gl.viewport(0, 0, width, height); gl.useProgram(program);
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, textures[i]);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }
    const first = sources[0] ? dimensions(sources[0]) : [1,1];
    const second = sources[1] ? dimensions(sources[1]) : first;
    gl.uniform2f(uniforms.size, logicalWidth, logicalHeight);
    gl.uniform2f(uniforms.firstSize, first[0], first[1]); gl.uniform2f(uniforms.secondSize, second[0], second[1]);
    gl.uniform2f(uniforms.tilt, tilt.x, tilt.y);
    const intro = plane.kind === "pair" ? plane.host.querySelector<HTMLElement>(".cinema-intro") : null;
    gl.uniform1f(uniforms.seam, intro ? (intro.offsetTop + 14) / logicalHeight : .5);
    gl.uniform1f(uniforms.time, now / 1000);
    gl.uniform1f(uniforms.pair, plane.kind === "pair" ? 1 : 0);
    gl.uniform1f(uniforms.background, plane.kind === "background" ? 1 : 0);
    gl.uniform1f(uniforms.lightweight, light ? 1 : 0);
    gl.uniform1f(uniforms.transition, Math.max(boost, Math.sin(Number(scene?.dataset.liquidProgress ?? 1) * Math.PI)));
    gl.uniform1f(uniforms.fit, sources[0] instanceof HTMLImageElement && getComputedStyle(sources[0]).objectFit === "contain" ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (plane.canvas.width !== width || plane.canvas.height !== height) { plane.canvas.width = width; plane.canvas.height = height; }
    plane.context.clearRect(0, 0, width, height);
    plane.context.drawImage(renderer, 0, 0);
    plane.canvas.style.visibility = "visible";
    plane.host.dataset.liquidSurface = "ready";
    if (plane.kind === "pair") plane.host.dataset.liquid = "webgl";
  }

  function move(event: PointerEvent) {
    if (event.pointerType !== "mouse" || !fine.matches || reduced.matches) return;
    tilt.targetX = (event.clientX / innerWidth - .5) * 2;
    tilt.targetY = (event.clientY / innerHeight - .5) * 2;
    lastMove = performance.now();
  }
  function leave() { tilt.targetX = 0; tilt.targetY = 0; }
  function scroll() {
    const distance = Math.abs(window.scrollY - scrollY);
    if (distance > 1) scrollAt = performance.now();
    scrollY = window.scrollY;
  }
  function tick(now: number) {
    frame = 0;
    if (document.hidden || (reduced.matches && staticPainted)) return;
    frame = requestAnimationFrame(tick);
    if (now - last < (light ? 66 : 40)) return;
    const elapsed = Math.min(100, now - last); last = now;
    if (now - lastMove > 650) leave();
    const ease = 1 - Math.exp(-elapsed / 220);
    tilt.x += (tilt.targetX - tilt.x) * ease; tilt.y += (tilt.targetY - tilt.y) * ease;
    reveal(now);
    if (!reduced.matches) {
      for (const scene of scenes) {
        const progress = Number(scene.dataset.liquidProgress ?? 1);
        if (progress > 0 && progress < 1) scene.style.clipPath = liquidReveal(progress, now / 1000);
      }
    }
    if (reduced.matches && staticPainted) return;
    const time = reduced.matches ? 0 : now / 1000;
    const boost = reduced.matches ? 0 : Math.exp(-(now - scrollAt) / 450) * .55;
    root.style.setProperty("--liquid-tilt-x", `${tilt.x * .32}deg`);
    root.style.setProperty("--liquid-tilt-y", `${-tilt.y * .24}deg`);
    root.style.setProperty("--liquid-text-axis-x", String(-tilt.y));
    root.style.setProperty("--liquid-text-axis-y", String(tilt.x));
    root.style.setProperty("--liquid-text-angle", `${Math.hypot(tilt.x, tilt.y) * .18}deg`);
    root.style.setProperty("--liquid-text-x", `${tilt.x * 2}px`);
    root.style.setProperty("--liquid-text-y", `${tilt.y * 1.5}px`);
    const edge = Array.from({ length: 33 }, (_, i) => {
      const x = i / 32;
      return `${x * 100}% ${14 + (Math.sin(x * 11 + time * .65) * .55 + Math.sin(x * 23 - time * .43) * .3 + Math.sin(x * 6 - time * .8) * .15) * 10}px`;
    });
    root.style.setProperty("--liquid-edge", `polygon(${edge.join(",")},100% 100%,0 100%)`);
    if (failed || reduced.matches) { restore(); staticPainted = reduced.matches; return; }
    root.dataset.liquidEngine = "webgl";
    for (const plane of planes) {
      try { renderPlane(plane, now, boost); }
      catch {
        plane.failed = true; plane.canvas.style.visibility = "hidden";
        plane.host.removeAttribute("data-liquid-surface");
        if (plane.kind === "pair") plane.host.dataset.liquid = "fallback";
      }
    }
  }
  function contextLost(event: Event) { event.preventDefault(); failed = true; restore(); }
  function wake() { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake();
  }
  function preference() { staticPainted = false; leave(); if (reduced.matches) restore(); wake(); }
  document.addEventListener("visibilitychange", visibility);
  renderer.addEventListener("webglcontextlost", contextLost);
  root.addEventListener("pointermove", move, { passive: true }); root.addEventListener("pointerleave", leave);
  window.addEventListener("scroll", scroll, { passive: true }); reduced.addEventListener("change", preference);

  // Film choices retain both video nodes; an organic wipe replaces the hard cut.
  const choices: { host: HTMLElement; selected: Element | null; outgoing: HTMLElement | null; at: number }[] = [];
  root.querySelectorAll<HTMLElement>(".cinema-scene-camera").forEach(host => choices.push({ host, selected: host.querySelector(".is-selected"), outgoing: null, at: 0 }));
  const selection = new MutationObserver(() => {
    for (const choice of choices) {
      const next = choice.host.querySelector(".is-selected");
      if (next === choice.selected) continue;
      choice.outgoing?.classList.remove("is-liquid-outgoing");
      (choice.selected as HTMLElement | null)?.style.removeProperty("clip-path");
      if (reduced.matches) {
        choice.selected = next; choice.outgoing = null;
        (next as HTMLElement | null)?.style.removeProperty("clip-path");
        continue;
      }
      choice.outgoing = choice.selected as HTMLElement | null;
      choice.outgoing?.classList.add("is-liquid-outgoing");
      choice.selected = next; choice.at = performance.now();
      if (next && !reduced.matches) (next as HTMLElement).style.clipPath = liquidReveal(0, choice.at / 1000);
    }
  });
  for (const choice of choices) selection.observe(choice.host, { subtree: true, attributes: true, attributeFilter: ["class"] });
  function reveal(now: number) {
    for (const choice of choices) {
      if (!choice.outgoing || !choice.selected) continue;
      const progress = reduced.matches ? 1 : Math.min(1, (now - choice.at) / 850);
      (choice.selected as HTMLElement).style.clipPath = liquidReveal(progress, now / 1000);
      if (progress === 1) {
        choice.outgoing.classList.remove("is-liquid-outgoing"); choice.outgoing = null;
        (choice.selected as HTMLElement).style.removeProperty("clip-path");
      }
    }
  }
  frame = requestAnimationFrame(tick);
  return () => {
    alive = false; atlas.onload = null;
    cancelAnimationFrame(frame); selection.disconnect(); restore();
    document.removeEventListener("visibilitychange", visibility);
    renderer.removeEventListener("webglcontextlost", contextLost);
    root.removeEventListener("pointermove", move); root.removeEventListener("pointerleave", leave);
    window.removeEventListener("scroll", scroll); reduced.removeEventListener("change", preference);
    for (const choice of choices) {
      choice.outgoing?.classList.remove("is-liquid-outgoing");
      (choice.selected as HTMLElement | null)?.style.removeProperty("clip-path");
    }
    for (const plane of planes) if (plane.owned) plane.canvas.remove();
    root.querySelectorAll(".liquid-section").forEach(section => section.classList.remove("liquid-section"));
    textures.forEach(texture => gl?.deleteTexture(texture)); shaders.forEach(shader => gl?.deleteShader(shader));
    gl?.deleteBuffer(buffer); gl?.deleteProgram(program); gl?.getExtension("WEBGL_lose_context")?.loseContext();
    root.style.removeProperty("--liquid-tilt-x"); root.style.removeProperty("--liquid-tilt-y"); root.style.removeProperty("--liquid-edge");
    for (const name of ["axis-x", "axis-y", "angle", "x", "y"]) root.style.removeProperty(`--liquid-text-${name}`);
    pairPosters.clear();
    delete root.dataset.liquidEngine;
  };
}
