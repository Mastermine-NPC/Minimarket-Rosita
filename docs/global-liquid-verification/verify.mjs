import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.VERIFICATION_OUT||'docs/global-liquid-verification';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
const errors=[],results=[];
const context=await browser.newContext({viewport:{width:1440,height:900}});
await context.addInitScript(()=>{
 const original=HTMLCanvasElement.prototype.getContext;window.__contexts=[];window.__tilts=[];window.__seeks=0;const time=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'currentTime');Object.defineProperty(HTMLMediaElement.prototype,'currentTime',{...time,set(value){window.__seeks++;time.set.call(this,value)}});
 HTMLCanvasElement.prototype.getContext=function(type,...args){const value=original.call(this,type,...args);if(type==='webgl'&&value&&!window.__contexts.includes(value)){window.__contexts.push(value);const uniform=value.uniform2f.bind(value);value.uniform2f=function(location,x,y){if(location?.__name==='tilt'){window.__tilts.push([x,y]);if(window.__tilts.length>100)window.__tilts.shift()}return uniform(location,x,y)};const get=value.getUniformLocation.bind(value);value.getUniformLocation=function(p,name){const result=get(p,name);if(result)result.__name=name;return result}}return value};
});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const pause=ms=>page.waitForTimeout(ms);
async function ready(selector){await page.waitForFunction(s=>document.querySelector(s)?.dataset.liquidSurface==='ready',selector,{timeout:30000})}
try{
 await page.goto('http://localhost:4190');await page.waitForFunction(()=>document.querySelector('.liquid-videos')?.dataset.liquid==='webgl');
 await page.evaluate(()=>window.__videos=[...document.querySelectorAll('.home-experience video')]);assert.equal(await page.locator('.home-experience video').count(),10);
 assert.equal(await page.evaluate(()=>window.__contexts.length),1);
 await pause(800);await page.screenshot({path:out+'/desktop-top.png'});
 const firstHash=await page.locator('.liquid-video-surface').evaluate(c=>c.toDataURL());await pause(300);assert.notEqual(await page.locator('.liquid-video-surface').evaluate(c=>c.toDataURL()),firstHash);
 await page.mouse.move(1400,700);await pause(250);assert(await page.evaluate(()=>window.__tilts.some(([x,y])=>Math.abs(x)>.1||Math.abs(y)>.1)));
 await pause(2000);assert(await page.evaluate(()=>window.__tilts.slice(-3).every(([x,y])=>Math.abs(x)<.02&&Math.abs(y)<.02)),'Stationary pointer returns to neutral');
 const seam=await page.locator('.cinema-intro').evaluate(el=>el.getBoundingClientRect().top+scrollY);await page.evaluate(y=>scrollTo({top:y-300,behavior:'instant'}),seam);await pause(700);await page.screenshot({path:out+'/desktop-seam.png'});
 const stage=await page.locator('.cinema-story').evaluate(el=>el.getBoundingClientRect().top+scrollY);await page.evaluate(y=>scrollTo({top:y-10,behavior:'instant'}),stage);await pause(1000);
 const chapters=['bebidas','snacks','cuidado','ideas','ferreteria'];
 for(let i=0;i<chapters.length;i++){
  await page.locator('.cinema-scene-navigation button').nth(i).click({force:true});await pause(1800);
  await ready(`#${chapters[i]} .cinema-film-layer.is-selected .ambient-video`);
  const scene=page.locator('#'+chapters[i]);const films=scene.locator('.cinema-film-picker button');const names=[];
  for(let film=0;film<await films.count();film++){
   await films.nth(film).click({force:true});await pause(1000);await ready(`#${chapters[i]} .cinema-film-layer.is-selected .ambient-video`);names.push(await films.nth(film).textContent());
   const source=await scene.locator('.is-selected video').evaluate(v=>({src:v.currentSrc,time:v.currentTime,paused:v.paused}));assert(!source.paused);
  }
  await page.screenshot({path:`${out}/desktop-${chapters[i]}.png`});results.push({chapter:chapters[i],films:names});
 }
 // Capture a non-rectangular intermediate reveal in the horizontal scroll sequence.
 const range=await page.locator('.cinema-story').evaluate(el=>({top:el.parentElement.getBoundingClientRect().top+scrollY,height:el.parentElement.offsetHeight-el.offsetHeight}));
 for(let i=0;i<4;i++){
 await page.evaluate(({range,i})=>scrollTo({top:range.top+range.height*(i+.5)/4,behavior:'instant'}),{range,i});await pause(1000);
 const incoming=page.locator('#'+chapters[i+1]);const mask=await incoming.evaluate(el=>el.style.clipPath);assert(mask.startsWith('polygon('));assert(mask.split(',').length>20);await pause(250);assert.notEqual(await incoming.evaluate(el=>el.style.clipPath),mask,'Wave evolves while scroll is stationary');await page.screenshot({path:out+'/horizontal-transition-'+i+'.png'});
 }
 for(const selector of ['.home-featured-section','.home-category-section','.home-delivery','.home-last-word']){
  await page.locator(selector).evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-40,behavior:'instant'}));await pause(1200);
  const bg=page.locator(selector+' > .liquid-background-plane');assert.equal(await bg.evaluate(c=>c.style.visibility),'visible');const hash=await bg.evaluate(c=>c.toDataURL());await pause(200);assert.notEqual(await bg.evaluate(c=>c.toDataURL()),hash,'Autonomous water on solid section');
  await page.screenshot({path:out+'/'+selector.slice(1)+'.png'});
 }
 assert.equal(await page.evaluate(()=>window.__contexts.length),1);assert(await page.evaluate(()=>window.__videos.every((v,i)=>v===document.querySelectorAll('.home-experience video')[i])));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.evaluate(()=>window.__contexts[0].getError()),0);
 await page.locator('.home-featured-section').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-50,behavior:'instant'}));await pause(700);await page.getByRole('button',{name:'Productos siguientes',exact:true}).click();await pause(600);assert(await page.locator('.home-carousel-viewport').evaluate(el=>el.scrollLeft>0));
 assert.equal(await page.evaluate(()=>window.__seeks),0,'The renderer never seeks videos');
 await page.evaluate(()=>document.querySelector('a[href="/catalogo"]').click());await page.waitForURL('**/catalogo');await page.locator('.catalog-page').waitFor();assert.equal(await page.locator('.liquid-media-plane').count(),0);assert(await page.evaluate(()=>window.__contexts[0].isContextLost()),'Route unmount releases GL context');
 await page.evaluate(()=>document.querySelector('a[href="/"]').click());await page.waitForURL('http://localhost:4190/');await page.waitForFunction(()=>document.querySelector('.liquid-videos')?.dataset.liquid==='webgl');assert.equal(await page.evaluate(()=>window.__contexts.filter(gl=>!gl.isContextLost()).length),1);
 await page.evaluate(()=>window.__contexts.at(-1).getExtension('WEBGL_lose_context').loseContext());await pause(400);assert.equal(await page.locator('.home-experience').getAttribute('data-liquid-engine'),'fallback');await page.screenshot({path:out+'/context-loss.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await pause(800);const edge=await page.locator('.home-experience').evaluate(el=>el.style.getPropertyValue('--liquid-edge'));await pause(300);assert.equal(await page.locator('.home-experience').evaluate(el=>el.style.getPropertyValue('--liquid-edge')),edge);
 // Navigate away/back: the renderer releases its context and leaves no owned canvases.
 await page.evaluate(()=>document.querySelector('a[href="/catalogo"]').click());await page.waitForURL('**/catalogo');await page.locator('.catalog-page').waitFor();assert.equal(await page.locator('.liquid-media-plane').count(),0);
 await context.close();
 for(const [width,height]of [[768,1024],[390,844]]){
  const touch=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});const p=await touch.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:4190');await p.waitForFunction(()=>document.querySelector('.liquid-videos')?.dataset.liquid==='webgl');
  for(const id of chapters){await p.locator('#'+id).evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-20,behavior:'instant'}));await p.waitForTimeout(700);await p.waitForFunction(id=>document.querySelector(`#${id} .is-selected .ambient-video`)?.dataset.liquidSurface==='ready',id,{timeout:30000})}
  await p.locator('.home-category-section').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-20,behavior:'instant'}));await p.waitForTimeout(1000);await p.screenshot({path:`${out}/touch-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await touch.close();
 }
 const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto('http://localhost:4190');await rp.locator('.liquid-videos').waitFor();await rp.waitForTimeout(700);assert.equal(await rp.locator('.home-experience').getAttribute('data-liquid-engine'),'fallback');await rp.screenshot({path:out+'/reduced.png'});await reduced.close();
 const disabled=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--disable-webgl']});const fp=await disabled.newPage({viewport:{width:1440,height:900}});await fp.goto('http://localhost:4190');await fp.locator('.liquid-videos').waitFor();await fp.waitForTimeout(1000);assert.equal(await fp.locator('.home-experience').getAttribute('data-liquid-engine'),'fallback');await fp.screenshot({path:out+'/no-webgl.png'});await disabled.close();
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/results.json',JSON.stringify({results,errors,contexts:1,stableVideoNodes:10},null,2));console.log('PASS all 10 videos, all 5 chapters, all 4 solid sections, autonomous water, idle perspective reset, horizontal reveals, touch, reduced motion, context loss, carousel and stable nodes');
}finally{await browser.close()}
