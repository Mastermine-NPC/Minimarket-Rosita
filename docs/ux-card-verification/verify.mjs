import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const{chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const{expect}=await import(process.env.PLAYWRIGHT_EXPECT_MODULE||'playwright/test');
const base=process.env.BASE_URL||'http://localhost:4190',out=process.env.VERIFICATION_OUT||'docs/ux-card-verification/screenshots';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});const results=[],errors=[];
for(const width of [1440,768,390]){
 const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width<900});page.on('pageerror',error=>errors.push({width,error:error.message}));
 await page.goto(base+'/catalogo');await page.locator('.product-card').first().waitFor();await expect(page.locator('.navigation-discover')).toHaveAttribute('aria-expanded','false');await page.mouse.move(width-5,700);await page.waitForTimeout(1200);
 const trigger=page.locator('.navigation-discover');await expect(trigger).toHaveAttribute('aria-expanded','false');assert.equal((await trigger.innerText()).trim(),'');
 await page.evaluate(()=>window.scrollTo({top:1400,behavior:'instant'}));await page.waitForTimeout(250);await expect(trigger).toHaveAttribute('aria-expanded','false');await page.evaluate(()=>window.scrollTo({top:900,behavior:'instant'}));await page.waitForTimeout(250);await expect(trigger).toHaveAttribute('aria-expanded','false');
 if(width===1440)await page.mouse.move(width/2,6);else await trigger.tap();await expect(trigger).toHaveAttribute('aria-expanded','true');await page.waitForTimeout(700);await page.screenshot({path:`${out}/header-open-${width}.png`});
 await page.getByRole('searchbox',{name:'Buscar productos'}).focus();await page.mouse.move(width-5,900);await page.waitForTimeout(850);await expect(trigger).toHaveAttribute('aria-expanded','true');await page.keyboard.press('Escape');await page.waitForTimeout(750);await expect(trigger).toHaveAttribute('aria-expanded','false');
 if(width<900){await trigger.tap();await expect(trigger).toHaveAttribute('aria-expanded','true');await trigger.tap();await expect(trigger).toHaveAttribute('aria-expanded','false');}else{await page.mouse.move(width/2,6);await page.waitForTimeout(700);await page.mouse.move(width-5,900);await page.waitForTimeout(850);await expect(trigger).toHaveAttribute('aria-expanded','false');}
 const card=page.locator('.product-card').first();await card.evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));await page.waitForTimeout(300);
 const style=await card.evaluate(el=>{const css=getComputedStyle(el);return{background:css.backgroundColor,blur:css.backdropFilter,color:getComputedStyle(el.querySelector('h3 a')).color}});assert(style.blur.includes('blur'));assert(style.background.startsWith('rgba(10, 25, 39,'));assert.equal(style.color,'rgb(239, 248, 252)');
 assert.equal(await page.locator('.store-shell').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(241, 242, 233)');
 for(const selector of ['.filter-sidebar','.store-header','.store-footer'])if(await page.locator(selector).count())assert.equal(await page.locator(selector).first().evaluate(el=>getComputedStyle(el).backdropFilter),'none');
 await page.screenshot({path:`${out}/catalog-glass-${width}.png`});
 await page.evaluate(()=>{window.__catalogNode=document.querySelector('.catalog-page');window.__doc=document});
 const retain=async(action,label)=>{const before=await page.evaluate(()=>scrollY);await action();await page.waitForTimeout(450);const after=await page.evaluate(()=>scrollY);assert(Math.abs(after-before)<=1,`${width} ${label}: ${before}→${after}`);assert(await page.evaluate(()=>window.__doc===document && window.__catalogNode===document.querySelector('.catalog-page')),label+' must not remount');console.log(width+' '+label+' kept '+after);};
 if(width<1024){await page.getByRole('button',{name:/^Filtros/}).scrollIntoViewIfNeeded();await page.getByRole('button',{name:/^Filtros/}).click();}
 await page.locator('#filter-brand').scrollIntoViewIfNeeded();await retain(()=>page.locator('#filter-brand').selectOption('Coca-Cola'),'brand');await expect(page.locator('.product-card')).toHaveCount(2);
 await retain(()=>page.locator('.checkbox-label').filter({hasText:'Solo disponibles'}).getByRole('checkbox').click(),'availability');
 await page.locator('#filter-price').scrollIntoViewIfNeeded();await page.locator('#filter-price').focus();await retain(()=>page.locator('#filter-price').press('Home'),'price');assert.equal(new URL(page.url()).searchParams.get('max'),'1');await retain(()=>page.locator('#filter-price').press('End'),'price reset');
 if(width<1024)await page.getByRole('button',{name:'Ver 2 productos',exact:true}).click();
 await page.locator('#catalog-sort').scrollIntoViewIfNeeded();await retain(()=>page.locator('#catalog-sort').selectOption('precio-desc'),'sort');assert.equal(new URL(page.url()).searchParams.get('orden'),'precio-desc');
 if(width<1280){
  await page.locator('#catalog-category').scrollIntoViewIfNeeded();await retain(()=>page.locator('#catalog-category').selectOption('consumibles'),'category');await expect(page).toHaveURL(/\/categoria\/consumibles/);
 }
 // Search stays at the current catalog viewport, including the header form.
 if(width===1440)await page.mouse.move(width/2,6);else await trigger.tap();await page.waitForTimeout(700);await page.getByRole('searchbox',{name:'Buscar productos'}).fill('Coca-Cola');await retain(()=>page.getByRole('button',{name:'Buscar',exact:true}).click(),'search');await expect(page.locator('.product-card')).toHaveCount(2);
 await page.goto(base+'/producto/ROS-001');await page.locator('.detail-information').waitFor();
 const related=page.locator('.product-card').first();await related.scrollIntoViewIfNeeded();assert((await related.evaluate(el=>getComputedStyle(el).backdropFilter)).includes('blur'));
 await page.screenshot({path:`${out}/related-glass-${width}.png`});
 results.push({width,header:'hidden at load and both scroll directions; proximity/touch/focus/exit work',glass:style,filters:'brand, stock, price, sort, search and category preserve scroll and DOM'});await page.close();
}
assert.deepEqual(errors,[]);await fs.writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));console.log(results);await browser.close();
