import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.VERIFICATION_OUT||'docs/intro-liquid-verification';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
const errors=[],results={};
const context=await browser.newContext({viewport:{width:1440,height:900}});
await context.addInitScript(()=>{
 window.__gls=[];window.__introSamples={poster:0,video:0};window.__seeks=0;
 const time=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'currentTime');Object.defineProperty(HTMLMediaElement.prototype,'currentTime',{...time,set(value){window.__seeks++;time.set.call(this,value)}});
 const original=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=original.call(this,type,...args);if(type==='webgl'&&gl&&!window.__gls.includes(gl)){window.__gls.push(gl);const upload=gl.texImage2D.bind(gl);gl.texImage2D=function(...args){const source=args.at(-1);if(source?.currentSrc?.includes('video-intro')){if(source.tagName==='IMG')window.__introSamples.poster++;if(source.tagName==='VIDEO')window.__introSamples.video++}return upload(...args)}}return gl};
});
let release;const gate=new Promise(resolve=>release=resolve);
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*.mp4',async route=>{await gate;await route.continue()});
const pause=ms=>page.waitForTimeout(ms);
const text=()=>page.locator('#momentos-title').evaluate(el=>{const c=getComputedStyle(el),b=el.getBoundingClientRect();return {text:el.textContent,font:c.font,fontSize:c.fontSize,color:c.color,rotate:c.rotate,translate:c.translate,filter:c.filter,x:b.x,y:b.y,width:b.width,height:b.height}});
try{
 await page.goto('http://localhost:4190');await page.waitForFunction(()=>document.querySelector('.liquid-videos')?.dataset.liquid==='webgl');
 await page.locator('.cinema-intro').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-120,behavior:'instant'}));await pause(1300);
 assert.equal(await page.locator('.cinema-intro video').evaluate(v=>v.readyState),0);assert(await page.evaluate(()=>window.__introSamples.poster>0));assert.equal(await page.evaluate(()=>window.__introSamples.video),0);assert.equal(await page.evaluate(()=>window.__gls.length),1);
 const before=await text();const canvas=page.locator('.liquid-video-surface');await canvas.evaluate(c=>window.__surface=c);
 const hash=await canvas.evaluate(c=>c.toDataURL());await pause(200);assert.notEqual(await canvas.evaluate(c=>c.toDataURL()),hash,'Water continues on posters without video or mouse');
 assert.equal(await page.locator('.cinema-intro > .ambient-video').evaluate(el=>getComputedStyle(el).opacity),'0');await page.screenshot({path:out+'/poster-loading.png'});
 await page.mouse.move(1350,700);await pause(300);const tilted=await text();assert.notEqual(tilted.rotate,before.rotate);assert.notEqual(tilted.translate,before.translate);assert.equal(tilted.filter,'none');for(const key of ['font','fontSize','color','text'])assert.equal(tilted[key],before[key]);assert(Math.abs(tilted.x-before.x)<4);assert(Math.abs(tilted.y-before.y)<4);await page.screenshot({path:out+'/poster-perspective.png'});
 await pause(2000);const neutral=await text();assert(Math.abs(parseFloat(neutral.translate))<.04);assert(Math.abs(parseFloat(neutral.rotate.split(' ').at(-1)))<.01);
 await page.evaluate(()=>{window.__blank=[];const pair=document.querySelector('.liquid-videos');const canvas=pair.querySelector('canvas');window.__watch=new MutationObserver(()=>{if(pair.dataset.liquid!=='webgl'||canvas.style.visibility!=='visible')window.__blank.push(pair.dataset.liquid)});window.__watch.observe(pair,{attributes:true,subtree:true,attributeFilter:['data-liquid','style']})});
 release();await page.waitForFunction(()=>window.__introSamples.video>0,{},{timeout:30000});await pause(700);assert(await canvas.evaluate(c=>c===window.__surface));assert.equal(await page.evaluate(()=>window.__gls.length),1);assert.deepEqual(await page.evaluate(()=>window.__blank),[]);assert.equal(await page.evaluate(()=>window.__seeks),0);await page.screenshot({path:out+'/video-playing.png'});
 const media=await page.locator('.cinema-intro video').evaluate(v=>({src:v.currentSrc,time:v.currentTime,paused:v.paused}));assert(!media.paused);assert(media.time>0);await pause(500);assert((await page.locator('.cinema-intro video').evaluate(v=>v.currentTime))>media.time);
 await page.evaluate(()=>window.__watch.disconnect());await page.emulateMedia({reducedMotion:'reduce'});await pause(500);const reduced=await text();assert.equal(reduced.rotate,'none');assert.equal(reduced.translate,'none');assert.equal(await page.locator('.liquid-videos').getAttribute('data-liquid'),'fallback');
 results.desktop={posterSampled:true,videoSampled:true,contexts:1,canvasRetained:true,blankFrames:0,seeks:0,text:{before,tilted,neutral},media};await context.close();
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobile=await touch.newPage();mobile.on('pageerror',e=>errors.push(e.message));await mobile.route('**/*.mp4',route=>route.abort());await mobile.goto('http://localhost:4190');await mobile.waitForFunction(()=>document.querySelector('.liquid-videos')?.dataset.liquid==='webgl');await mobile.locator('.cinema-intro').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-80,behavior:'instant'}));await mobile.waitForTimeout(1200);assert.equal(await mobile.locator('#momentos-title').evaluate(el=>getComputedStyle(el).rotate),'none');assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.screenshot({path:out+'/mobile-poster.png'});results.mobile={posterOnFailedVideo:true,overflow:false,perspectiveDisabled:true};await touch.close();
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/results.json',JSON.stringify({results,errors},null,2));console.log('PASS poster before video, autonomous refraction, single canvas/context, seamless texture handoff, sharp native text perspective/idle reset, reduced motion and mobile');
}finally{release();await browser.close()}
