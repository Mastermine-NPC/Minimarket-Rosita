import { useEffect, useRef } from "react";
/** A single lightweight WebGL surface; commerce never imports the Three.js viewer. */
export function EditorialAtmosphere({ background = true }: { background?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const element = cursor.current;
      if (!element || event.pointerType !== "mouse") return;
      element.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      const target = (event.target as Element).closest("a,button,[data-viewer-mode='3d'],input,textarea");
      element.dataset.active = target ? "true" : "false";
      element.dataset.label = target?.matches("[data-viewer-mode='3d']") ? "Girar" : target?.matches("a") ? "Ver" : "";
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  useEffect(() => {
    if (!background) return;
    const node = canvas.current;
    if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = node.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const shader = (type: number, code: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, code); gl.compileShader(s); shaders.push(s); return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, "attribute vec2 p; varying vec2 uv; void main(){uv=p*.5+.5; gl_Position=vec4(p,0.,1.);}"));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `precision mediump float; varying vec2 uv; uniform float t; uniform vec2 mouse;
      void main(){vec2 p=uv; float d=length(p-mouse); p+=.025*sin(p.yx*7.+t*.22)*exp(-d*2.); float wave=sin(p.x*7.+p.y*4.+t*.12); float light=smoothstep(.85,0.,length(p-vec2(.75,.6))); vec3 color=mix(vec3(.91,.94,.87),vec3(.96,.77,.81),smoothstep(.1,1.,wave)*.45);color=mix(color,vec3(.67,.81,.71),light*.5);gl_FragColor=vec4(color,1.);}`));
    gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const attr = gl.getAttribLocation(program, "p"); gl.enableVertexAttribArray(attr); gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
    const time = gl.getUniformLocation(program,"t"), mouse = gl.getUniformLocation(program,"mouse");
    let x=.5,y=.5, frame=0, last=0;
    const resize=()=> {node.width=Math.min(innerWidth,1200);node.height=Math.min(innerHeight,900);gl.viewport(0,0,node.width,node.height);}; resize();
    const move=(e:PointerEvent)=> {x=e.clientX/innerWidth;y=1-e.clientY/innerHeight;
    };
    const render=(now:number)=> {frame=requestAnimationFrame(render);if(document.hidden || now-last<50)return;last=now;gl.uniform1f(time,now/1000+scrollY*.003);gl.uniform2f(mouse,x,y);gl.drawArrays(gl.TRIANGLES,0,6);}; frame=requestAnimationFrame(render);
    window.addEventListener("resize",resize);window.addEventListener("pointermove",move,{passive:true});
    return()=> {cancelAnimationFrame(frame);window.removeEventListener("resize",resize);window.removeEventListener("pointermove",move);gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));gl.getExtension("WEBGL_lose_context")?.loseContext();};
  },[background]);
  return <><canvas className="editorial-atmosphere" ref={canvas} aria-hidden="true"/><div className="editorial-cursor" ref={cursor} aria-hidden="true"/></>;
}
