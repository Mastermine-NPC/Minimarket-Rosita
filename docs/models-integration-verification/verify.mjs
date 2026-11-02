import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { expect } = await import(process.env.PLAYWRIGHT_EXPECT_MODULE || 'playwright/test');
const out=process.env.VERIFICATION_OUT || 'docs/models-integration-verification/screenshots';
const base=process.env.BASE_URL || 'http://localhost:4190';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
const items=[
 {id:'ROS-064',key:'coca-cola-can',name:'Coca-Cola en lata',price:450,stock:12,category:'consumibles'},
 {id:'ROS-002',key:'lays-classic',name:'Papas Lay’s clásicas',price:400,stock:18,category:'consumibles'},
 {id:'ROS-065',key:'nivea-aftershave',name:'Nivea Aftershave',price:2490,stock:8,category:'cuidado-personal'},
 {id:'ROS-066',key:'sunsilk-shampoo',name:'Champú Sunsilk',price:1290,stock:10,category:'cuidado-personal'},
];
const results=[],errors=[],brokenResources=[];
for(const width of [1440,768,390]){
 const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width<900,reducedMotion:'reduce'});
 page.on('pageerror',error=>errors.push({width,error:error.message}));
 const dismissNavigation=async()=>{await page.waitForTimeout(60);const trigger=page.locator('.navigation-discover');if(await trigger.getAttribute('aria-expanded')==='true')await trigger.click();await page.mouse.move(width-5,900);await page.waitForTimeout(60);};
 page.on('response',response=>{if(response.status()>=400 && /\.(glb|png|webp|js)(\?|$)/.test(response.url()))brokenResources.push(response.url())});
 for(const item of items){
  await page.goto(base+'/catalogo?q='+encodeURIComponent(item.name));
  const card=page.locator(`.product-card[data-product-id="${item.id}"]`);await expect(card).toBeVisible();
  const image=card.locator('img');if(await image.count())await expect.poll(()=>image.evaluate(el=>el.complete && el.naturalWidth>0)).toBe(true);
  await card.locator('.product-photo-link').click();await page.waitForURL(new RegExp('/producto/'+item.id));
  await page.locator('[data-model-state=ready]').waitFor({timeout:45000});
  await expect(page.locator('h1')).toHaveText(item.name);
  await expect(page.locator('.detail-commerce .product-price strong')).toHaveText('S/ '+(item.price/100).toFixed(2));
  await expect(page.locator('.detail-commerce .stock-label')).toContainText(item.stock+' unidades');
  await page.waitForTimeout(200);await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await dismissNavigation();
  await page.screenshot({path:`${out}/${item.key}-${width}.png`,fullPage:true});
  const canvas=page.locator('.product-3d-canvas canvas');await canvas.scrollIntoViewIfNeeded();const before=await canvas.screenshot();
  await page.getByRole('button',{name:'Girar a la derecha',exact:true}).click();await page.waitForTimeout(150);assert(!before.equals(await canvas.screenshot()),'Rotation must change actual pixels: '+item.key);
  const rotated=await canvas.screenshot();await page.getByRole('button',{name:'Acercar modelo',exact:true}).click();await page.waitForTimeout(150);assert(!rotated.equals(await canvas.screenshot()),'Zoom must change actual pixels: '+item.key);
  await page.getByRole('button',{name:'Restablecer',exact:true}).click();
  if(width<900){await canvas.scrollIntoViewIfNeeded();await dismissNavigation();const box=await canvas.boundingBox();const cdp=await page.context().newCDPSession(page);const x=box.x+box.width*.4,y=box.y+box.height*.5;assert.equal(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.tagName,{x,y}),'CANVAS','Touch must hit the model canvas');const touchBefore=await canvas.screenshot();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});for(let step=1;step<=8;step++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+step*10,y:y+10,id:1}]});await page.waitForTimeout(35);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);assert(!touchBefore.equals(await canvas.screenshot()),'Touch rotation: '+item.key);await cdp.detach();}
  const increase=page.getByRole('button',{name:'Aumentar '+item.name,exact:true});
  if(item.key==='coca-cola-can')await increase.click();
  if(item.key==='nivea-aftershave' && width===1440){for(let i=1;i<item.stock;i++)await increase.click();await expect(increase).toBeDisabled();const decrease=page.getByRole('button',{name:'Disminuir '+item.name,exact:true});for(let i=0;i<item.stock;i++)await decrease.click();await expect(page.getByRole('button',{name:'Agregar al carrito',exact:true})).toBeDisabled();await increase.click();}
  await page.getByRole('button',{name:'Agregar al carrito',exact:true}).click();
  console.log(width+': '+item.key+' catalog / model / rotation / zoom / quantity / add passed');
  const inventory=await page.evaluate(id=>JSON.parse(localStorage.getItem('minimarket-rosita:app')).data.inventory[id],item.id);assert.equal(inventory.stock,item.stock,'Add to cart must not consume stock');
 }
 await page.goto(base+'/catalogo?q='+encodeURIComponent("Lay's"));await page.locator('.product-grid').waitFor();assert.equal(await page.locator('.product-card').count(),10,'All ten identifiable flavours must be searchable');
 await page.screenshot({path:`${out}/lays-catalog-${width}.png`,fullPage:true});
 await page.goto(base+'/categoria/cuidado-personal?marca=Nivea&disponibles=1');await expect(page.locator('.product-card[data-product-id="ROS-065"]')).toBeVisible();assert.equal(await page.locator('.product-card').count(),1);
 const requested=[];page.on('request',request=>requested.push(request.url()));await page.goto(base+'/producto/ROS-001');await expect(page.locator('[data-viewer-mode=photograph]')).toBeVisible();await expect(page.locator('h1')).toHaveText('Gaseosa Coca-Cola');assert.equal(await page.locator('.product-3d-canvas canvas').count(),0);assert(!requested.some(url=>url.endsWith('.glb')||url.includes('product-model-canvas')));await page.screenshot({path:`${out}/bottle-preserved-${width}.png`,fullPage:true});
 await page.goto(base+'/carrito');await expect(page.locator('.subtotal-row strong')).toHaveText('S/ 50.80');await page.screenshot({path:`${out}/cart-${width}.png`,fullPage:true});
 await page.goto(base+'/registro?volver=%2Fcheckout');await page.locator('#auth-name').fill('Cliente Modelos');await page.locator('#auth-email').fill(`modelos-${width}@rosita.test`);await page.locator('#auth-password').fill('Demo123!');await page.locator('#auth-confirm').fill('Demo123!');await page.getByRole('button',{name:'Crear cuenta de demostración',exact:true}).click();await page.waitForURL('**/checkout');
 await page.locator('#delivery-mode').selectOption('pickup');await page.locator('#delivery-recipient').fill('Cliente Modelos');await page.locator('#delivery-phone').fill('999123456');await page.getByRole('button',{name:'Continuar al pago simulado',exact:true}).click();await page.locator('#cash-amount').fill('100');await page.getByRole('button',{name:'Revisar pedido',exact:true}).click();await page.getByRole('button',{name:'Confirmar pedido de demostración',exact:true}).click();await page.waitForURL(/\/confirmacion$/);await page.locator('.order-code').waitFor();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('minimarket-rosita:app')).data);assert.equal(stored.orders.length,1);assert.equal(stored.orders[0].lines.length,4);assert.equal(stored.orders[0].totalCents,5080);assert.deepEqual(stored.cart,{});
 for(const item of items)assert.equal(stored.inventory[item.id].stock,item.stock-(item.key==='coca-cola-can'?2:1));assert.equal(stored.inventory['ROS-001'].stock,24);
 // Simulate another application restart/update: preserve completed order and adjusted inventory.
 await page.evaluate(()=>{const value=JSON.parse(localStorage.getItem('minimarket-rosita:app'));delete value.data.modelCatalogRevision;localStorage.setItem('minimarket-rosita:app',JSON.stringify(value))});await page.reload();await page.locator('.order-code').waitFor();
 const restarted=await page.evaluate(()=>JSON.parse(localStorage.getItem('minimarket-rosita:app')).data);assert.deepEqual(restarted.orders,stored.orders);assert.deepEqual(restarted.inventory,stored.inventory);assert.equal(restarted.products.length,75);
 for(const item of items){await page.goto(base+'/catalogo?q='+encodeURIComponent(item.name));await expect(page.locator(`.product-card[data-product-id="${item.id}"]`)).toBeVisible();}
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 results.push({width,products:items.map(item=>item.id),controls:'rotation/zoom/touch',catalog:'search, ten Lay’s variants, brand and availability filters',purchase:'5 units, 4 products, S/50.80, one stock deduction',restart:'75 products; order and inventory preserved',bottle:'ROS-001 photo, no engine or GLB requested'});await page.close();
}
assert.deepEqual(errors,[]);assert.deepEqual(brokenResources,[]);await fs.writeFile(`${out}/browser-results.json`,JSON.stringify({results,errors,brokenResources},null,2));console.log(results);await browser.close();
