import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {expect}=await import(process.env.PLAYWRIGHT_EXPECT_MODULE || 'playwright/test');
const base=process.env.BASE_URL||'http://localhost:4190',out=process.env.VERIFICATION_OUT||'docs/normal-catalog-verification/screenshots';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
const items=[{id:'ROS-064',name:'Coca-Cola en lata',query:'Coca-Cola',category:'consumibles'},{id:'ROS-002',name:'Papas Lay’s clásicas',query:"Lay's",category:'consumibles'},{id:'ROS-065',name:'Nivea Aftershave',query:'Nivea',category:'cuidado-personal'},{id:'ROS-066',name:'Champú Sunsilk',query:'Sunsilk',category:'cuidado-personal'}];
const reports=[],errors=[];
for(const width of [1440,768,390]){
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce',hasTouch:width<900});page.on('pageerror',error=>errors.push(error.message));
 const requested=[];page.on('request',request=>requested.push(request.url()));
 await page.goto(base+'/catalogo');await expect(page.locator('.product-card')).toHaveCount(75);assert.equal(new URL(page.url()).search,'');
 const first12=await page.locator('.product-card').evaluateAll(cards=>cards.slice(0,12).map(card=>card.dataset.productId));
 for(const item of items)assert(first12.includes(item.id));assert(first12.includes('ROS-001'));assert(!requested.some(url=>url.endsWith('.glb')||url.includes('product-model-canvas')));
 await expect(page.locator('.product-card a[href*="ROS-3D"]')).toHaveCount(0);
 for(const item of items){await page.locator(`.product-card[data-product-id="${item.id}"]`).evaluate(card=>window.scrollTo({top:card.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));await page.waitForTimeout(80);const trigger=page.locator('.navigation-discover');if(await trigger.getAttribute('aria-expanded')==='true')await trigger.click();await page.mouse.move(width-5,950);await page.waitForTimeout(60);await page.screenshot({path:`${out}/catalogo-${item.id}-${width}.png`});}
 for(const item of items){await page.goto(base+'/catalogo?q='+encodeURIComponent(item.query));await expect(page.locator(`.product-card[data-product-id="${item.id}"]`)).toBeVisible();if(item.id==='ROS-002')await expect(page.locator('.product-card')).toHaveCount(10);await page.goto(base+'/categoria/'+item.category);await expect(page.locator(`.product-card[data-product-id="${item.id}"]`)).toBeVisible();}
 await page.goto(base+'/catalogo?orden=precio-asc');await page.locator('.product-card').first().waitFor();const prices=await page.locator('.product-card .product-price strong').allTextContents();const values=prices.map(value=>Number(value.replace(/[^\d.]/g,'')));assert.deepEqual(values,[...values].sort((a,b)=>a-b));
 await page.goto(base+'/categoria/cuidado-personal?marca=Nivea&disponibles=1');await expect(page.locator('.product-card')).toHaveCount(1);await expect(page.locator('.product-card[data-product-id="ROS-065"]')).toBeVisible();
 for(const item of items){
  await page.goto(base+'/catalogo');await page.locator(`.product-card[data-product-id="${item.id}"] .product-photo-link`).click();await page.waitForURL(new RegExp('/producto/'+item.id));await page.locator('[data-model-state=ready]').waitFor({timeout:45000});await expect(page.locator('h1')).toHaveText(item.name);await page.getByRole('button',{name:'Girar a la derecha',exact:true}).click();await page.getByRole('button',{name:'Acercar modelo',exact:true}).click();await page.getByRole('button',{name:'Agregar al carrito',exact:true}).click();console.log(width+': ordinary catalog → '+item.name+' → GLB → cart');
 }
 await page.goto(base+'/carrito');await expect(page.locator('.cart-line')).toHaveCount(4);await expect(page.locator('.subtotal-row strong')).toHaveText('S/ 46.30');await page.screenshot({path:`${out}/cart-${width}.png`,fullPage:true});
 await page.goto(base+'/catalogo?q=ROS-3D');await expect(page.locator('.catalog-empty')).toBeVisible();await expect(page.locator('.product-card')).toHaveCount(0);
 await page.goto(base+'/catalogo');await expect(page.locator('.product-card')).toHaveCount(75);await page.reload();await expect(page.locator('.product-card')).toHaveCount(75);
 reports.push({width,url:base+'/catalogo',products:75,first12,passed:['all four among ordinary featured products','name search and ten Lay’s flavours','existing category, brand, availability and price sorting','same product cards and detail routes, GLBs, quantity and cart','legacy search unnecessary and no longer matches public product codes','reload without duplicates']});await page.close();
}
// Upgrade a prior session with legacy canonical IDs and a nonempty cart.
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await page.goto(base+'/producto/ROS-064');await page.getByRole('button',{name:'Agregar al carrito',exact:true}).click();
await page.evaluate(()=>{
 const value=JSON.parse(localStorage.getItem('minimarket-rosita:app'));const data=value.data;data.modelCatalogRevision='rosita-four-glb-v1';
 const mapping={};for(const product of data.products.filter(product=>product.modelKey)){
  const legacyId=product.modelKey==='coca-cola-can'?'ROS-3D-COLA':product.modelKey==='nivea-aftershave'?'ROS-3D-NIVEA':product.modelKey==='sunsilk-shampoo'?'ROS-3D-SUNSILK':'ROS-3D-LAYS-'+product.modelKey.slice(5).toUpperCase();mapping[product.id]=legacyId;data.inventory[legacyId]=data.inventory[product.id];delete data.inventory[product.id];product.id=legacyId;product.code=legacyId;delete product.featured;
 }
 data.cart=Object.fromEntries(Object.entries(data.cart).map(([id,n])=>[mapping[id]||id,n]));data.inventory['ROS-3D-COLA']={priceCents:875,stock:7};localStorage.setItem('minimarket-rosita:app',JSON.stringify(value));
});
await page.reload();await expect(page.locator('h1')).toHaveText('Coca-Cola en lata');await expect(page.locator('.detail-code')).toHaveText('ROS-064');await expect(page.locator('.detail-commerce .product-price strong')).toHaveText('S/ 8.75');await page.getByRole('button',{name:'Agregar al carrito',exact:true}).click();
const migrated=await page.evaluate(()=>JSON.parse(localStorage.getItem('minimarket-rosita:app')).data);assert.equal(migrated.products.length,75);assert.equal(migrated.cart['ROS-3D-COLA'],2);assert.equal(migrated.inventory['ROS-3D-COLA'].stock,7);assert.equal(migrated.inventory['ROS-064'],undefined);
await page.goto(base+'/carrito');await expect(page.locator('.cart-line-info>a')).toHaveAttribute('href','/producto/ROS-064');await page.locator('.cart-line-info>a').click();await page.locator('[data-model-state=ready]').waitFor();await expect(page.locator('h1')).toHaveText('Coca-Cola en lata');await page.goto(base+'/catalogo');await expect(page.locator('.product-card')).toHaveCount(75);await expect(page.locator('.product-card a[href*="ROS-3D"]')).toHaveCount(0);await page.screenshot({path:`${out}/legacy-session-normal-catalog.png`});
assert.deepEqual(errors,[]);await fs.writeFile(`${out}/results.json`,JSON.stringify({reports,legacyMigration:'numeric public codes and routes; historical keys, edited price, inventory and cart preserved',errors},null,2));await browser.close();console.log('Normal catalog and persisted legacy session passed.');
