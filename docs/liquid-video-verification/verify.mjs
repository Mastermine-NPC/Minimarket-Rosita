import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.VERIFICATION_OUT||'docs/liquid-video-verification';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
const errors=[],results=[];
async function inspect(options,name){
 const context=await browser.newContext(options);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4190');await page.locator('.liquid-videos').waitFor();
 if(options.reducedMotion!=='reduce')await page.waitForFunction(()=>[...document.querySelectorAll('.liquid-videos video')].every(v=>v.readyState>=2),{},{timeout:30000});
 if(options.reducedMotion!=='reduce')await page.waitForFunction(()=>document.querySelector('.liquid-videos').dataset.liquid==='webgl');
 await page.waitForTimeout(700);await page.screenshot({path:`${out}/${name}-top.png`});
 const initial=await page.evaluate(()=>{window.__films=[...document.querySelectorAll('.liquid-videos video')];return window.__films.map(v=>({time:v.currentTime,src:v.currentSrc,paused:v.paused,duration:v.duration}))});
 const seam=await page.locator('.cinema-intro').evaluate(el=>el.getBoundingClientRect().top+scrollY);
 await page.evaluate(y=>scrollTo({top:y-300,behavior:'instant'}),seam);await page.waitForTimeout(600);
 await page.mouse.move(options.viewport.width*.7,300);await page.waitForTimeout(700);await page.screenshot({path:`${out}/${name}-seam.png`});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const after=await page.evaluate(()=>[...document.querySelectorAll('.liquid-videos video')].map((v,i)=>({same:v===window.__films[i],src:v.currentSrc,time:v.currentTime,paused:v.paused})));
 after.forEach((v,i)=>{assert(v.same);assert.equal(v.src,initial[i].src);if(options.reducedMotion!=='reduce'){assert(!v.paused);assert(v.time!==initial[i].time)}});
 if(name==='desktop'){
  await page.evaluate(()=>document.querySelector('.liquid-video-surface').getContext('webgl').getExtension('WEBGL_lose_context').loseContext());await page.waitForTimeout(250);
  assert.equal(await page.locator('.liquid-videos').getAttribute('data-liquid'),'fallback');await page.screenshot({path:out+'/context-loss.png'});
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);const a=await page.locator('.liquid-videos').evaluate(el=>el.style.getPropertyValue('--liquid-edge'));await page.waitForTimeout(300);assert.equal(await page.locator('.liquid-videos').evaluate(el=>el.style.getPropertyValue('--liquid-edge')),a);
 }
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.getByRole('link',{name:'Explorar productos',exact:true}).first().click();await page.waitForURL('**/catalogo');
 results.push({name,initial,after,overflow:false,link:true});await context.close();
}
try{
 await inspect({viewport:{width:1440,height:900}},'desktop');
 await inspect({viewport:{width:768,height:1024},hasTouch:true,isMobile:true},'tablet');
 await inspect({viewport:{width:390,height:844},hasTouch:true,isMobile:true},'mobile');
 await inspect({viewport:{width:390,height:844},reducedMotion:'reduce'},'reduced');
 const fallback=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--disable-webgl']});const page=await fallback.newPage({viewport:{width:1440,height:900}});await page.goto('http://localhost:4190');await page.locator('.liquid-videos').waitFor();await page.waitForTimeout(1000);assert.equal(await page.locator('.liquid-videos').getAttribute('data-liquid'),'fallback');await page.screenshot({path:out+'/no-webgl.png'});await fallback.close();
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/results.json',JSON.stringify({results,errors},null,2));console.log('PASS liquid video playback, stable nodes/sources, responsive, reduced motion, context loss, no-WebGL and links');
}finally{await browser.close()}
