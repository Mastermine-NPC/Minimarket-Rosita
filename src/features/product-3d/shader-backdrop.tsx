import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector2, type ShaderMaterial } from "three";
import type { ProductModelConfig } from "./types";
const vertexShader = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.0);}`;
const fragmentShader = `
varying vec2 vUv;
uniform float uTime; uniform float uDistortion; uniform float uAspect; uniform vec2 uPointer;
float grain(vec2 pixel){
 return fract(52.9829189*fract(dot(pixel,vec2(.06711056,.00583715))));
}
void main(){
 vec2 uv=vUv; vec2 p=(uv-.5)*vec2(uAspect,1.);
 vec2 center=uPointer*.025; vec2 delta=p-center; float radius=length(delta);
 float envelope=exp(-radius*3.6);
 vec2 displacement=normalize(delta+vec2(.0001))*sin(radius*28.-uTime*1.5)*uDistortion*.12*envelope;
 vec2 refracted=p+displacement;
 // Neutral charcoal studio, shared by every product regardless of its accent or exposure.
 vec2 field=refracted*vec2(.9,1.1);
 float light=exp(-dot(field,field)*5.5);
 float shade=mix(.018,.205,light);
 // Static screen-space grain avoids flicker and needs no downloaded texture.
 shade+=(grain(gl_FragCoord.xy)-.5)*.018;
 // Values are display-space: model exposure must not alter the reference background.
 gl_FragColor=vec4(vec3(clamp(shade,0.,1.)),1.);
}`;
export function ShaderBackdrop({ config, reduced, pointer }: { config: ProductModelConfig["background"]; reduced: boolean; pointer: Vector2 }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uDistortion: { value: reduced ? 0 : config.distortion }, uPointer: { value: new Vector2() }, uAspect: { value: 1 } }), [config, reduced]);
  useFrame(({ clock, size }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = reduced ? 0 : clock.elapsedTime * config.speed;
    material.current.uniforms.uAspect.value = size.width / Math.max(1, size.height);
    if (reduced) material.current.uniforms.uPointer.value.set(0, 0);
    else material.current.uniforms.uPointer.value.lerp(pointer, 0.07);
  });
  return <mesh frustumCulled={false} renderOrder={-10}>
    <planeGeometry args={[2, 2]} /><shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} toneMapped={false} depthWrite={false} depthTest={false} />
  </mesh>;
}
