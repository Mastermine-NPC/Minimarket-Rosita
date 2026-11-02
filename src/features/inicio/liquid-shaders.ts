export const liquidVertex = `attribute vec2 position; varying vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;

// Shared by the original two-film compositor, every scene and decorative plane.
export const liquidFragment = `precision highp float;
varying vec2 uv;
uniform sampler2D firstFilm,secondFilm;
uniform vec2 size,firstSize,secondSize,tilt;
uniform float seam,time,pair,background,lightweight,transition,fit;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
vec2 cover(vec2 p,vec2 source,vec2 target){
 float a=source.x/source.y,b=target.x/target.y;
 vec2 ratio=mix(vec2(min(1.,b/a),min(1.,a/b)),vec2(max(1.,b/a),max(1.,a/b)),fit);
 return (p-.5)*ratio+.5;
}
void main(){
 vec2 p=vec2(uv.x,1.-uv.y), aspect=vec2(size.x/size.y,1.);
 vec2 field=p*aspect*4.;
 float n=noise(field+vec2(time*.13,-time*.1));
 float m=noise(field*1.8+vec2(-time*.09,time*.12));
 float strength=mix(1.,.55,lightweight)*(1.+transition*.65);
 // Autonomous refraction: pointer coordinates never enter the wave/noise field.
 vec2 ripple=vec2(sin(field.y*3.+time*.7+n*3.),cos(field.x*2.6-time*.6+m*3.))*.0025*strength/aspect;
 vec2 q=p+ripple;
 // A shallow perspective projection, independent of the water animation.
 vec2 centered=q-.5;
 float depth=1.+dot(centered,tilt)*.022;
 q=centered/depth+.5+tilt*.0025;
 float sheen=(n+m-1.)*.018*strength;
 if(background>.5){gl_FragColor=vec4(vec3(step(0.,sheen)),abs(sheen)*.9);return;}
 vec2 a;
 vec4 first;
 if(pair>.5){
   float wave=(sin(p.x*11.+time*.65)*.55+sin(p.x*23.-time*.43)*.3+sin(p.x*6.-time*.8)*.15)*19.;
   wave+=sin(p.x*19.-time*1.8)*transition*6.;
   float boundary=seam+wave/size.y;
   a=cover(vec2(q.x,1.-q.y/seam),firstSize,vec2(size.x,size.y*seam));
   a.x+=(.43-.5)*(1.-min(1.,(size.x/(size.y*seam))/(firstSize.x/firstSize.y)))*step(size.x,700.);
   vec2 b=cover(vec2(q.x,1.-(q.y-seam)/(1.-seam)),secondSize,vec2(size.x,size.y*(1.-seam)));
   vec3 one=texture2D(firstFilm,clamp(a,.001,.999)).rgb;
   vec3 two=texture2D(secondFilm,clamp(b,.001,.999)).rgb;
   one=mix(one,vec3(.035,.122,.141),mix(.72,.18,smoothstep(0.,.7,p.x)));
   one=mix(one,vec3(.035,.122,.141),smoothstep(.5,1.,p.y/seam)*.5);
   two=mix(two,vec3(.027,.082,.055),.6);
   first=vec4(mix(one,two,smoothstep(boundary-1.5/size.y,boundary+1.5/size.y,p.y)),1.);
 }else{
   a=cover(vec2(q.x,1.-q.y),firstSize,size);
   first=texture2D(firstFilm,clamp(a,.001,.999));
   if(fit>.5 && (a.x<0.||a.x>1.||a.y<0.||a.y>1.))first=vec4(0.);
 }
 gl_FragColor=vec4(first.rgb+sheen,first.a);
}`;

/** Organic reveal with exact endpoints; also used by GSAP's horizontal sequence. */
export function liquidReveal(progress: number, time: number, vertical = false) {
  const p = Math.max(0, Math.min(1, progress));
  const amplitude = Math.sin(p * Math.PI) * 2.3;
  const points = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    const edge = (1 - p) * 100 + amplitude * (Math.sin(t * 13 + time) + Math.sin(t * 23 - time * .7) * .35);
    return vertical ? `${t * 100}% ${edge}%` : `${edge}% ${t * 100}%`;
  });
  return `polygon(${points.join(",")},100% 100%,${vertical ? "0 100%" : "100% 0"})`;
}
