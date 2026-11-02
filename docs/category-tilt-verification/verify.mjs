import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.VERIFICATION_OUT||'docs/category-tilt-verification';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
const results=[],errors=[];
const base='http://localhost:4190';
const snapshot=card=>card.evaluate(el=>{const h=el.querySelector('h3'),p=el.querySelector('.home-category-caption p'),style=getComputedStyle(el),title=getComputedStyle(h);return {name:h.textContent,description:p.textContent,href:el.getAttribute('href'),width:el.offsetWidth,height:el.offsetHeight,color:title.color,font:title.font,border:style.border,background:style.backgroundColor,rotate:style.rotate,translate:style.translate,x:Number(el.style.getPropertyValue('--category-tilt-x')),y:Number(el.style.getPropertyValue('--category-tilt-y')),active:Number(el.style.getPropertyValue('--category-tilt-active')),lightX:el.style.getPropertyValue('--category-tilt-light-x'),media:getComputedStyle(el.querySelector('.home-category-media')).transform,title:getComputedStyle(h).transform,descriptionDepth:getComputedStyle(p).transform,icon:getComputedStyle(el.querySelector('.home-category-arrow')).transform}});
async function scroll(page,card){await card.evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-180,behavior:'instant'}));await page.waitForTimeout(1100)}
try{
 for(const [width,height]of [[1440,1000],[768,1024]]){
  const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('[data-category-tilt]').first().waitFor();const cards=page.locator('.home-category-card'),count=await cards.count();assert(count>0);const names=[];
  const canvasCount=await page.locator('canvas').count();
  for(let i=0;i<count;i++){
   const card=cards.nth(i);await page.mouse.move(width-5,100);await scroll(page,card);const before=await snapshot(card),box=await card.boundingBox();
   await page.mouse.move(box.x+box.width*.85,box.y+box.height*.3);await page.waitForTimeout(400);const tilted=await snapshot(card);assert(tilted.x>.3);assert(tilted.y<-.15);assert(tilted.active>.9);assert.notEqual(tilted.rotate,before.rotate);assert.equal(new Set([tilted.media,tilted.title,tilted.descriptionDepth,tilted.icon]).size,4,'Different layer depths');assert(parseFloat(tilted.lightX)>60);
   for(const field of ['name','description','href','width','height','font','color','border','background'])assert.deepEqual(tilted[field],before[field]);
   if((await card.getAttribute('class')).includes('home-category-jugueteria'))await page.screenshot({path:`${out}/${width}-jugueteria.png`});
   await page.mouse.move(box.x+box.width*.2,box.y+box.height*.65);await page.waitForTimeout(400);const opposite=await snapshot(card);assert(opposite.x<-.25);assert(opposite.y>.1);assert(parseFloat(opposite.lightX)<40);
   await page.mouse.move(width-5,100);await page.waitForTimeout(1000);const neutral=await snapshot(card);assert(Math.abs(neutral.x)<.002);assert(Math.abs(neutral.y)<.002);assert(neutral.active<.002);names.push(before.name);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.equal(await page.locator('canvas').count(),canvasCount);
  // Native focus, outline and Enter navigation survive the decorative layers.
  const card=cards.first();await scroll(page,card);await card.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert(await card.evaluate(el=>el===document.activeElement));const href=await card.getAttribute('href');await page.keyboard.press('Enter');await page.waitForURL(base+href);await page.waitForFunction(()=>document.querySelectorAll('[data-category-tilt]').length===0);
  results.push({width,height,names,keyboard:true,layoutUnchanged:true,overflow:false,noExtraCanvas:true});await context.close();
 }
 for(const [width,height]of [[768,1024],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('[data-category-tilt]').first().waitFor();const cards=page.locator('.home-category-card'),names=[];
  for(let i=0;i<await cards.count();i++){
   const card=cards.nth(i);await scroll(page,card);const before=await snapshot(card);
   // Dispatch touch press/cancel to observe feedback without following the link yet.
   await card.dispatchEvent('pointerdown',{pointerType:'touch',pointerId:7,bubbles:true});await page.waitForTimeout(180);const pressed=await snapshot(card);assert(pressed.active>.1);assert.equal(pressed.x,0);assert.equal(pressed.y,0);await card.dispatchEvent('pointercancel',{pointerType:'touch',pointerId:7,bubbles:true});await page.waitForTimeout(900);const after=await snapshot(card);assert(after.active<.002);assert.equal(after.width,before.width);assert.equal(after.height,before.height);names.push(before.name);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if((await card.getAttribute('class')).includes('home-category-jugueteria'))await page.screenshot({path:`${out}/touch-${width}-jugueteria.png`});
  }
  const first=cards.first();await scroll(page,first);const href=await first.getAttribute('href');await first.tap();await page.waitForURL(base+href);results.push({width,height,touch:true,names,pressResets:true,tapNavigation:true,overflow:false});await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();await page.goto(base);const card=page.locator('.home-category-card').first();await scroll(page,card);const box=await card.boundingBox();await page.mouse.move(box.x+box.width*.9,box.y+50);await page.waitForTimeout(300);const reduced=await snapshot(card);assert.equal(reduced.rotate,'none');assert.equal(reduced.active,0);assert.equal(reduced.translate,'none');await page.screenshot({path:out+'/reduced.png'});await context.close();assert.deepEqual(errors,[]);await fs.writeFile(out+'/results.json',JSON.stringify({results,errors,reduced:true},null,2));console.log('PASS all category cards: desktop/tablet tilt, independent layers, reflection, reset, original layout and styles, touch feedback/cancel/tap, keyboard, reduced motion, no extra canvas');
}finally{await browser.close()}
