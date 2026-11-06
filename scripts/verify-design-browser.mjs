/* global document, innerWidth, getComputedStyle */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const {expect}=await import(process.env.PLAYWRIGHT_EXPECT_MODULE||'playwright/test');
const base=process.env.BASE_URL||'http://localhost:4191',out=process.env.VERIFICATION_OUT||'/tmp/design-browser';await fs.mkdir(out,{recursive:true});
const password=process.env.DESIGN_TEST_PASSWORD||await fs.readFile(process.env.DESIGN_SECRET_FILE,'utf8');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(15000);
const errors=[],routes=[];page.on('pageerror',e=>errors.push(e.message));
const appState=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minimarket-rosita:app')).data);
try{
 await page.goto(base+'/admin/personalizacion');await expect(page.getByRole('heading',{name:'Acceso de personal de demostración.'})).toBeVisible();
 await page.goto(base+'/personal');await page.locator('.auth-demo-access summary').click();await page.getByRole('button',{name:'Completar acceso de administrador',exact:true}).click();await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();await page.waitForURL('**/admin');
 const before=await appState();await fs.writeFile(out+'/inspection-seed.json',await page.evaluate(()=>localStorage.getItem('minimarket-rosita:app')));
 await page.getByRole('link',{name:'Personalización visual',exact:true}).click();await page.locator('.design-editor').waitFor();
 await page.locator('.design-access summary').click();await page.getByLabel('Credencial del servidor',{exact:true}).fill(password);await page.getByRole('button',{name:'Autorizar publicación',exact:true}).click();await expect(page.getByRole('button',{name:'Cerrar permiso de publicación'})).toBeVisible();
 await page.getByRole('button',{name:/^Colores/}).click();await page.getByLabel('Color primario',{exact:true}).fill('#224c70');await expect(page.locator('.design-live-preview [data-slot=button][data-variant=default]').first()).toHaveCSS('background-color','rgb(34, 76, 112)');
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()),'#145a46');
 await page.getByRole('link',{name:'Laboratorio UI',exact:true}).click();await expect.poll(()=>page.locator('#rosita-ui-lab-host').evaluate(el=>el.style.getPropertyValue('--primary'))).toBe('#224c70');
 await page.getByRole('link',{name:'Editor de identidad',exact:true}).click();await expect(page.getByLabel('Color primario',{exact:true})).toHaveValue('#224c70');
 await page.getByRole('button',{name:/^Botones/}).click();const radius=page.getByLabel('Radio de botones',{exact:true});await radius.focus();await radius.press('Home');for(let i=0;i<18;i++)await radius.press('ArrowRight');await expect(radius).toHaveValue('18');
 await page.getByRole('button',{name:/^Tipografía/}).click();await page.getByLabel('Familia de lectura',{exact:true}).selectOption('Georgia, serif');
 await page.getByRole('button',{name:'Comparar versiones',exact:true}).click();
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});await page.screenshot({path:`${out}/editor-${width}.png`,fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`editor overflow ${width}`);}
 await page.setViewportSize({width:1440,height:1000});
 await page.getByRole('button',{name:'Abrir vista de ruta',exact:true}).click();const frame=page.frameLocator('iframe[title="Vista previa de la ruta con la propuesta"]');await expect(frame.locator('.product-card').first()).toBeVisible();await expect.poll(()=>frame.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--primary').trim())).toBe('#224c70');
 await page.getByRole('button',{name:'Publicar cambios',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Configuración publicada para todos'})).toBeVisible();
 const publicContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),visitor=await publicContext.newPage();await visitor.goto(base+'/catalogo');await visitor.locator('.product-card').first().waitFor();assert.equal(await visitor.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()),'#224c70');assert.equal(await visitor.evaluate(()=>getComputedStyle(document.body).fontFamily),'Georgia, serif');
 await visitor.screenshot({path:out+'/visitor-published.png'});await visitor.reload();assert.equal(await visitor.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--radius-control').trim()),'18px');
 await visitor.locator('.product-add:not(:disabled)').first().click();await visitor.goto(base+'/carrito');await visitor.locator('.cart-line').first().waitFor();assert((await visitor.locator('.cart-line').count())>0);await visitor.screenshot({path:out+'/cart-published.png'});
 for(const width of [768,390]){await visitor.setViewportSize({width,height:900});await visitor.goto(base+'/catalogo');await visitor.locator('.product-card').first().waitFor();assert(await visitor.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await visitor.screenshot({path:`${out}/catalog-published-${width}.png`});await visitor.goto(base+'/carrito');await visitor.locator('.cart-line').first().waitFor();assert(await visitor.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await publicContext.close();
 await page.reload();await page.locator('.design-editor').waitFor();await page.getByRole('button',{name:/^Colores/}).click();await expect(page.getByLabel('Color primario',{exact:true})).toHaveValue('#224c70');
 // Legacy address reuses the existing, now protected laboratory.
 await page.goto(base+'/laboratorio-ui');await page.waitForURL('**/admin/personalizacion/laboratorio');await page.locator('#rosita-ui-lab-host').waitFor();await expect(page.locator('#rosita-ui-lab-host h1')).toHaveText('Design Tokens');await page.screenshot({path:out+'/lab-integrated.png'});
 await page.getByRole('link',{name:'Variantes A/B',exact:true}).click();await expect(page.locator('#rosita-ui-lab-host h1')).toContainText('A/B');
 await page.getByRole('link',{name:'Componentes reales',exact:true}).click();await page.getByRole('button',{name:'Probar modal',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Cerrar vista previa',exact:true}).click();
 await page.getByRole('link',{name:'Editor de identidad',exact:true}).click();await page.locator('.design-editor').waitFor();page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Restaurar originales',exact:true}).click();await page.getByRole('button',{name:'Publicar cambios',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Configuración publicada para todos'})).toBeVisible();
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()),'#145a46');
 const after=await appState();for(const key of ['cart','inventory','orders','sales','products','users','categories'])assert.deepEqual(after[key],before[key],`commerce changed: ${key}`);
 // All declared route families, including each actual category. Empty/missing detail states remain valid views.
 const categories=before.categories.filter(c=>c.active!==false).map(c=>'/categoria/'+c.slug);
 const order=before.orders[0]?.id||'technical-missing';
 const paths=['/','/catalogo',...categories,'/producto/ROS-001','/producto/ROS-060','/carrito','/checkout','/login','/registro','/personal','/cuenta','/mis-pedidos',`/pedido/${order}`,`/pedido/${order}/confirmacion`,`/pedido/${order}/seguimiento`,'/nosotros','/ayuda','/contacto','/sistema-diseno','/comprobacion','/estado','/admin','/admin/productos','/admin/categorias','/admin/inventario','/admin/pedidos',`/admin/pedidos/${order}`,'/admin/clientes','/admin/agentes','/admin/ubicacion','/admin/reportes','/caja','/no-existe'];
 for(const path of paths){console.log('Checking '+path);await page.goto(base+path);await page.locator('h1').first().waitFor();assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()),'#145a46');routes.push(path);}
 await page.goto(base+'/');await page.locator('.home-opening h1').waitFor();assert.equal(await page.locator('.home-experience video').count(),8);
 const mediaContext=await browser.newContext({viewport:{width:1440,height:1000}}),media=await mediaContext.newPage();media.setDefaultTimeout(30000);
 await media.goto(base+'/');const film=media.locator('.home-opening video').first();await film.waitFor();await expect.poll(()=>film.evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(2);const time=await film.evaluate(v=>v.currentTime);await media.waitForTimeout(600);assert((await film.evaluate(v=>v.currentTime))>time,'Home video must still play');
 for(const id of ['ROS-064','ROS-002','ROS-065','ROS-066']){await media.goto(base+'/producto/'+id);await media.locator('.product-3d-presentation canvas').waitFor();await expect(media.locator('.product-3d-engine')).toHaveAttribute('data-model-state','ready',{timeout:30000});await media.getByRole('button',{name:'Girar a la derecha',exact:true}).click();await expect(media.locator('.product-3d-fallback')).toHaveCount(0);await media.screenshot({path:`${out}/model-${id}.png`});}
 await mediaContext.close();
 await page.goto(base+'/admin/personalizacion');await page.locator('.design-editor').waitFor();await page.screenshot({path:out+'/editor-restored.png'});
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/results.json',JSON.stringify({routes,errors,tests:['server permission','draft scoped','color live','radius live','typography live','comparison 3 widths','iframe real route','publication','independent visitor','reload persistence','cart','protected legacy lab','A/B reuse','real modal','restore','commerce unchanged','route families','8 Home videos','Home playback','4 GLB viewers ready and rotation']},null,2));
 console.log(`PASS design browser: ${routes.length} routes, editor responsive, draft vs published, server authorization, independent visitor, persistence, restoration, protected lab, components and commerce unchanged.`);
}finally{await browser.close();}
