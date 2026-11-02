import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Vector2, type ShaderMaterial } from "three";
import type { ProductModelConfig } from "./types";
const vertexShader = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.0);}`;
const fragmentShader = `
varying vec2 vUv;
uniform vec3 uColor; uniform vec3 uAccent;
uniform float uTime; uniform float uDistortion; uniform float uAspect; uniform vec2 uPointer;
void main(){
 vec2 uv=vUv; vec2 p=(uv-.5)*vec2(uAspect,1.);
 vec2 center=uPointer*.13; vec2 delta=p-center; float radius=length(delta);
 float envelope=exp(-radius*3.6);
 vec2 displacement=normalize(delta+vec2(.0001))*sin(radius*28.-uTime*1.5)*uDistortion*envelope;
 vec2 refracted=p+displacement;
 float ribbons=sin(refracted.x*8.+sin(refracted.y*6.+uTime*.25)*.9);
 float lighting=smoothstep(-1.,1.,ribbons)*.09+exp(-length(refracted-vec2(-.4,.4))*2.)*.25;
 vec3 color=mix(uColor,uAccent,clamp(envelope*.12+lighting*.12,0.,.22));
 color*=.86+lighting;
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
export function ShaderBackdrop({ config, reduced, pointer }: { config: ProductModelConfig["background"]; reduced: boolean; pointer: Vector2 }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uColor: { value: new Color(config.color) }, uAccent: { value: new Color(config.accent) }, uTime: { value: 0 }, uDistortion: { value: reduced ? 0 : config.distortion }, uPointer: { value: new Vector2() }, uAspect: { value: 1 } }), [config, reduced]);
  useFrame(({ clock, size }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = reduced ? 0 : clock.elapsedTime * config.speed;
    material.current.uniforms.uAspect.value = size.width / Math.max(1, size.height);
    if (reduced) material.current.uniforms.uPointer.value.set(0, 0);
    else material.current.uniforms.uPointer.value.lerp(pointer, 0.07);
  });
  return <mesh frustumCulled={false} renderOrder={-10}>
    <planeGeometry args={[2, 2]} /><shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} depthWrite={false} depthTest={false} />
  </mesh>;
}
