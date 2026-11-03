import fs from 'node:fs/promises';
const{chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const out=process.env.VERIFICATION_OUT;await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});const results=[];
for(let run=0;run<3;run++){
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
 await page.addInitScript(()=>{window.__stats={rootWrites:0,geometry:0,resizes:0,copies:0,draws:0};const set=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(k,v,p){if(document.querySelector('.home-experience')?.style===this&&k.startsWith('--liquid'))window.__stats.rootWrites++;return set.call(this,k,v,p)};
 const rect=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(){if(this.closest?.('.home-experience'))window.__stats.geometry++;return rect.call(this)};
 for(const k of ['width','height']){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,k);Object.defineProperty(HTMLCanvasElement.prototype,k,{...d,set(v){window.__stats.resizes++;d.set.call(this,v)}})}
 const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args){window.__stats.copies++;return draw.apply(this,args)};
 const glDraw=WebGLRenderingContext.prototype.drawArrays;WebGLRenderingContext.prototype.drawArrays=function(...args){window.__stats.draws++;return glDraw.apply(this,args)};
 });
 await page.goto('http://localhost:4190');await page.locator('.home-category-grid').waitFor();await page.locator('.home-category-grid').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-120,behavior:'instant'}));await page.waitForTimeout(1800);
 const before=(await cdp.send('Performance.getMetrics')).metrics;await page.evaluate(()=>{Object.keys(window.__stats).forEach(k=>window.__stats[k]=0);window.__frames=[];let prev=performance.now();window.__raf=requestAnimationFrame(function tick(t){window.__frames.push(t-prev);prev=t;window.__raf=requestAnimationFrame(tick)})});
 for(let i=0;i<12;i++){await page.mouse.move(200+(i%3)*380,300+(i%2)*160);await page.waitForTimeout(150)}await page.mouse.move(1435,100);await page.waitForTimeout(1800);
 const data=await page.evaluate(()=>{cancelAnimationFrame(window.__raf);const f=window.__frames.slice(2).sort((a,b)=>a-b);return{...window.__stats,p95FrameMs:f[Math.floor(f.length*.95)],frames:f.length,categoryCanvas:document.querySelectorAll('.home-category-grid canvas').length}});const after=(await cdp.send('Performance.getMetrics')).metrics;
 data.elapsedSeconds=after.find(m=>m.name==='Timestamp').value-before.find(m=>m.name==='Timestamp').value;
 for(const key of ['RecalcStyleDuration','LayoutDuration','ScriptDuration','TaskDuration'])data[key]=(after.find(m=>m.name===key).value-before.find(m=>m.name===key).value)*1000;
 results.push(data);if(run===0)await page.screenshot({path:out+'/categories.png'});await page.close();
}await fs.writeFile(out+'/performance.json',JSON.stringify({viewport:'1440x1000',runs:results},null,2));console.log(JSON.stringify(results));await browser.close();
