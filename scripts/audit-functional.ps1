param([string]$Phase='baseline-functional',[string]$Repo='\\wsl.localhost\Ubuntu\home\hisok\Desktop\extension-cor\PROYECTO-PROTOTIPO')
. "$PSScriptRoot/audit-browser-common.ps1"
$results=New-Object System.Collections.Generic.List[object]
function Check([string]$name,[string]$expression){$value=Eval-JS $expression;$results.Add(@{name=$name;result=$value});$results.ToArray()|ConvertTo-Json -Depth 30|Set-Content (Join-Path $out 'checks.json') -Encoding UTF8;Write-Output "$name : $($value|ConvertTo-Json -Depth 4 -Compress)"}
function Fill([string]$selector,[string]$value){Eval-JS "(()=>{const e=document.querySelector('$selector');if(!e)throw Error('Missing input: $selector');const proto=e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,'$value');e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true})()"|Out-Null;Start-Sleep -Milliseconds 100}
function Seed([string]$role){Navigate '/catalogo';Eval-JS "(async()=>{const fixture=await fetch('/__audit-fixture/$role').then(r=>r.json());localStorage.setItem('minimarket-rosita:app',JSON.stringify(fixture));sessionStorage.setItem('minimarket-rosita:tab-session',JSON.stringify(fixture.data.sessionUserId));return true})()"|Out-Null}
function Click-Text([string]$text){Eval-JS "(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('$text'));if(!b)throw Error('Button missing: $text');b.click();return true})()"|Out-Null;Start-Sleep -Milliseconds 250}
Set-Viewport 1440 900
Seed 'guest';Navigate '/catalogo?q=coca&marca=Coca-Cola&orden=precio-asc'
Check 'search-brand-sort' "(()=>{const cards=[...document.querySelectorAll('.catalog-products .product-card')];const prices=cards.map(c=>Number(c.querySelector('.product-price strong').textContent.replace(/[^0-9.]/g,'')));return {count:cards.length,names:cards.map(c=>c.querySelector('h3').textContent),ascending:prices.every((p,i)=>!i||p>=prices[i-1])}})()"
Navigate '/catalogo?q=producto-que-no-existe';Check 'empty-search' "!!document.querySelector('.catalog-empty')"
Navigate '/catalogo'
Check 'promotions-after-two-rows' "(()=>{const g=document.querySelector('.catalog-products');const cols=getComputedStyle(g).gridTemplateColumns.split(/\s+/).length;let products=0;const offsets=[];for(const e of g.children){if(e.matches('.product-card'))products++;else if(e.matches('.catalog-promotion'))offsets.push(products)}return {columns:cols,offsets,valid:offsets.every((n,i)=>n===cols*2*(i+1))}})()"
Navigate '/producto/ROS-001'
Eval-JS "document.querySelector('.detail-add').click()"|Out-Null;Start-Sleep -Milliseconds 250
Check 'add-product-and-persist' "(()=>{const data=JSON.parse(localStorage.getItem('minimarket-rosita:app')).data;return {quantity:data.cart['ROS-001'],stock:data.inventory['ROS-001'].stock,added:document.querySelector('.detail-added')?.innerText}})()"
Navigate '/carrito';Check 'cart-reload' "({text:document.querySelector('.cart-page')?.innerText.slice(-1200),cart:JSON.parse(localStorage.getItem('minimarket-rosita:app')).data.cart})"
Navigate '/login'
Click-Text 'Completar acceso de cliente';Click-Text 'Iniciar sesión';Start-Sleep -Milliseconds 700
Check 'customer-login-ui' "({url:location.pathname,user:JSON.parse(sessionStorage.getItem('minimarket-rosita:tab-session'))})"
Navigate '/cuenta';Check 'account' "document.querySelector('h1')?.textContent"
Navigate '/admin';Check 'customer-cannot-admin' "document.querySelector('h1')?.textContent"
Seed 'customer';Navigate '/checkout';Check 'checkout-initial' "({text:document.body.innerText.slice(-2500),fields:[...document.querySelectorAll('input,select')].map(e=>({id:e.id,name:e.name,type:e.type,value:e.value})),buttons:[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(Boolean)})"
Fill '#delivery-mode' 'pickup'
Fill '#delivery-recipient' 'Cliente Auditoria'
Fill '#delivery-phone' '999123456'
Click-Text 'Continuar al pago simulado'
Check 'checkout-delivery-validation' "({step:document.querySelector('.checkout-steps [aria-current]')?.textContent,errors:[...document.querySelectorAll('[role=alert]')].map(e=>e.textContent),fields:[...document.querySelectorAll('input')].map(e=>({id:e.id,type:e.type,value:e.value}))})"
Fill '#cash-amount' '100'
Click-Text 'Revisar pedido'
Click-Text 'Confirmar pedido de demostración'
Start-Sleep -Milliseconds 500
Check 'checkout-confirmed-exactly-once' "(()=>{const s=JSON.parse(localStorage.getItem('minimarket-rosita:app')).data;return {path:location.pathname,orders:s.orders.length,stock:s.inventory['ROS-001'].stock,movements:s.movements.length,cart:s.cart}})()"
Seed 'guest';Navigate '/personal';Click-Text 'Completar acceso de administrador';Click-Text 'Iniciar sesión';Start-Sleep -Milliseconds 700
Check 'admin-login-ui' "({url:location.pathname,user:JSON.parse(sessionStorage.getItem('minimarket-rosita:tab-session'))})"
Navigate '/admin/productos';Fill '#admin-products-search' 'Calabaza';Check 'halloween-admin' "({text:document.body.innerText.includes('Calabaza infantil'),count:document.querySelectorAll('tbody tr').length,buttons:[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(Boolean).slice(-15)})"
Click-Text 'Editar'
Set-Viewport 320 568
Check 'admin-edit-dialog-mobile' "(()=>{const d=document.querySelector('[role=dialog]');const r=d.getBoundingClientRect();return {width:innerWidth,left:r.left,right:r.right,scrollWidth:document.documentElement.scrollWidth}})()"
Fill '#product-price' '12.90'
Click-Text 'Guardar producto'
Check 'admin-save-price' "JSON.parse(localStorage.getItem('minimarket-rosita:app')).data.inventory['ROS-076'].priceCents"
Set-Viewport 1440 900
Seed 'cashier';Navigate '/caja';Check 'cash-screen' "({text:document.body.innerText.slice(0,2200),buttons:[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(Boolean).slice(0,20)})"
Click-Text 'Ir a apertura de turno'
Fill '#shift-float' '100'
Click-Text 'Abrir turno'
Click-Text 'Nueva venta'
Click-Text 'Agregar Calabaza infantil'
Fill '#cash-received' '100'
Click-Text 'Cobrar venta simulada'
Start-Sleep -Milliseconds 800
Check 'cash-halloween-sale' "(()=>{const s=JSON.parse(localStorage.getItem('minimarket-rosita:app')).data;return {sales:s.sales.length,sale:s.sales.at(-1)?.lines,stock:s.inventory['ROS-076'].stock,movements:s.movements.length}})()"
Seed 'guest';Navigate '/catalogo';Set-Viewport 375 667
Eval-JS "document.querySelector('.navigation-discover').focus();document.querySelector('.navigation-discover').click()"|Out-Null;Start-Sleep -Milliseconds 250
Check 'mobile-menu' "({open:document.querySelector('.navigation-discover').getAttribute('aria-expanded'),width:document.documentElement.scrollWidth,viewport:innerWidth,focus:document.activeElement?.outerHTML.slice(0,150)})"
Screenshot 'mobile-menu'
Send-CDP 'Input.dispatchKeyEvent' @{type='keyDown';key='Escape';code='Escape';windowsVirtualKeyCode=27}|Out-Null
Start-Sleep -Milliseconds 150
Check 'escape-menu' "document.querySelector('.navigation-discover').getAttribute('aria-expanded')"
Seed 'guest';Navigate '/registro'
Fill '#auth-name' 'Cliente Auditoria'
Fill '#auth-email' 'auditoria-20261103@rosita.test'
Fill '#auth-password' 'AuditoriaDemo!2026'
Fill '#auth-confirm' 'AuditoriaDemo!2026'
Click-Text 'Crear cuenta'
Start-Sleep -Milliseconds 600
Check 'registration-ui' "(()=>{const s=JSON.parse(localStorage.getItem('minimarket-rosita:app')).data;return {path:location.pathname,user:s.users.find(u=>u.email==='auditoria-20261103@rosita.test')?.role}})()"
$script:events.ToArray()|ConvertTo-Json -Depth 30|Set-Content (Join-Path $out 'events.json') -Encoding UTF8
$ws.Dispose()
