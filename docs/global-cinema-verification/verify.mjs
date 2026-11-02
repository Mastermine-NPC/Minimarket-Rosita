import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH});
const base = process.env.BASE_URL || 'http://localhost:4174';
const out = process.env.VERIFICATION_OUT || 'docs/global-cinema-verification';
await fs.mkdir(out, {recursive:true});
const errors=[], results=[];
const paths=['/','/catalogo','/categoria/consumibles','/categoria/ferreteria','/categoria/tecnologia','/categoria/jugueteria','/categoria/educacion-oficina','/categoria/cuidado-personal','/producto/ROS-001','/nosotros','/contacto','/ayuda','/carrito','/checkout','/login','/registro','/cuenta','/mis-pedidos','/pedido/ausente/seguimiento','/personal','/sistema-diseno','/comprobacion','/estado','/no-existe'];
for(const width of [1440,768,390]) {
 const page=await browser.newPage({viewport:{width,height:width===390?844:1000}});
 page.on('pageerror',error=>errors.push(error.message));
 for(const path of paths){
  await page.goto(base+path); await page.locator('h1').first().waitFor(); await page.waitForTimeout(1000);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false, `${width} overflow ${path}`);
  assert.equal(await page.getByRole('button',{name:/pausar.*video|reproducir.*video/i}).count(),0);
  assert.equal(await page.locator('video').evaluateAll(v=>v.filter(el=>!el.paused).length)<=1,true);
  await page.screenshot({path:`${out}/${path.replaceAll('/','_')||'home'}-${width}.png`});
 }
 await page.goto(base);await page.locator('.cinema-story').waitFor();await page.waitForTimeout(800);
 assert.match(await page.locator('.cinema-hero video').getAttribute('src'),/Arequipa-backgraound-02/);
 if(width>=900){
  assert(await page.locator('.cinema-story').evaluate(el=>el.classList.contains('is-pinned')));
  await page.locator('.cinema-scene-navigation button').nth(2).click({force:true});
  await page.waitForTimeout(1800);
  assert.equal(await page.locator('.cinema-scene-navigation [aria-current]').innerText(),'Nivea');
  await page.screenshot({path:`${out}/pinned-${width}.png`});
 } else assert.equal(await page.locator('.cinema-story.is-pinned').count(),0);
 await page.goto(base+'/catalogo'); await page.locator('h1').waitFor(); await page.waitForTimeout(700);
 await page.locator('.store-header a[href="/nosotros"]').count().then(async count=>{
  if(count) await page.locator('.store-header a[href="/nosotros"]').first().click();
  else await page.locator('.store-footer a[href="/nosotros"]').first().click();
 });
 await page.waitForTimeout(150); assert.equal(await page.locator('.cinema-route-curtain').evaluate(el=>getComputedStyle(el).pointerEvents),'auto');
 await page.waitForTimeout(1500);assert.equal(await page.locator('.public-route-content').getAttribute('data-route-path'),'/nosotros');
 await page.goBack();await page.waitForTimeout(1500);assert.equal(await page.locator('.public-route-content').getAttribute('data-route-path'),'/catalogo');
 results.push(`${width}: ${paths.length} public routes, no overflow or video controls, background 2, video budget, route shutter and Back`);
 await page.close();
}
const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:1440,height:1000}});
await page.goto(base); await page.locator('h1').waitFor(); await page.waitForTimeout(500);
assert.equal(await page.locator('video[src]').count(),0);
assert.equal(await page.locator('.cinema-story.is-pinned').count(),0);
assert.equal(await page.locator('.cinema-scene[aria-hidden="true"]').count(),0);
await page.screenshot({path:`out/reduced.png`.replace('out',out)});
results.push('Reduced motion: no automatic video, no pinning, every scene readable');
await page.close();assert.deepEqual(errors,[]);
await fs.writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));console.log(results);await browser.close();
