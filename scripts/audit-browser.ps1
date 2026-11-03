param([string]$Phase='baseline',[string]$Repo='\\wsl.localhost\Ubuntu\home\hisok\Desktop\extension-cor\PROYECTO-PROTOTIPO')
. "$PSScriptRoot/audit-browser-common.ps1"
$viewports=@(@(320,568),@(375,667),@(390,844),@(430,932),@(768,1024),@(1024,768),@(1280,720),@(1440,900),@(1920,1080))
$routes=@(
 @('/', 'guest'),@('/catalogo','guest'),@('/catalogo?q=coca&marca=Coca-Cola&orden=precio-asc','guest'),
 @('/categoria/consumibles','guest'),@('/categoria/halloween','guest'),@('/categoria/no-existe','guest'),
 @('/producto/ROS-001','guest'),@('/producto/ROS-064','guest'),@('/producto/no-existe','guest'),@('/carrito','guest'),
 @('/nosotros','guest'),@('/ayuda','guest'),@('/contacto','guest'),@('/personal','guest'),@('/login','guest'),@('/registro','guest'),
 @('/cuenta','customer'),@('/checkout','customer'),@('/mis-pedidos','customer'),@('/pedido/ROS-AUDIT-ORDER','customer'),@('/pedido/ROS-AUDIT-ORDER/confirmacion','customer'),@('/pedido/ROS-AUDIT-ORDER/seguimiento','customer'),@('/pedido/no-existe','customer'),
 @('/admin','guest'),@('/admin','admin'),@('/admin/productos','admin'),@('/admin/categorias','admin'),@('/admin/inventario','admin'),@('/admin/pedidos','admin'),@('/admin/pedidos/ROS-AUDIT-ORDER','admin'),@('/admin/clientes','admin'),@('/admin/agentes','admin'),@('/admin/ubicacion','admin'),@('/admin/reportes','admin'),@('/admin/no-existe','admin'),@('/caja','cashier'),
 @('/sistema-diseno','guest'),@('/comprobacion','guest'),@('/estado','guest'),@('/no-existe','guest')
)
$results=New-Object System.Collections.Generic.List[object]
Navigate '/catalogo'
$role=''
foreach($entry in $routes){
 $route=$entry[0];$nextRole=$entry[1]
 if($role -ne $nextRole){
  Eval-JS "(async()=>{const fixture=await fetch('/__audit-fixture/$nextRole').then(r=>r.json());localStorage.setItem('minimarket-rosita:app',JSON.stringify(fixture));sessionStorage.setItem('minimarket-rosita:tab-session',JSON.stringify(fixture.data.sessionUserId));return true})()"|Out-Null
  $role=$nextRole
 }
 Set-Viewport 1440 900;Navigate $route
 $routeResult=[ordered]@{route=$route;role=$role;viewports=@();events=@()}
 foreach($size in $viewports){
  Set-Viewport $size[0] $size[1];Start-Sleep -Milliseconds 70
  $measure=Eval-JS @'
(()=>{const w=innerWidth;const bad=[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>0 && s.display!=='none' && s.visibility!=='hidden' && !e.closest('[aria-hidden="true"],.cinema-route-curtain,.leaflet-container,.product-zoom-canvas,.home-carousel-viewport,.cinema-story,.cinema-hero-media') && (r.right>w+2 || r.left< -2) && s.position!=='absolute'}).slice(0,15).map(e=>({tag:e.tagName,class:e.className?.baseVal??e.className,text:e.textContent?.trim().slice(0,70),left:Math.round(e.getBoundingClientRect().left),right:Math.round(e.getBoundingClientRect().right)}));return {width:w,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,title:document.title,h1:[...document.querySelectorAll('h1')].map(e=>e.textContent.trim()),overflow:bad,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.currentSrc),buttons:[...document.querySelectorAll('button')].filter(b=>!b.textContent.trim()&&!b.getAttribute('aria-label')&&!b.getAttribute('aria-labelledby')&&!b.title).map(b=>b.outerHTML.slice(0,180)),bodyText:document.body.innerText.slice(0,180),lcp:performance.getEntriesByType('largest-contentful-paint').at(-1)?.startTime,resources:performance.getEntriesByType('resource').reduce((a,r)=>a+r.transferSize,0),duration:performance.getEntriesByType('navigation')[0]?.loadEventEnd}})()
'@
  $routeResult.viewports+= $measure
  if($size[0] -in @(375,1440)){ $slug=($route -replace '[^a-zA-Z0-9-]','_');Screenshot "$slug-$role-$($size[0])" }
 }
 $routeResult.events=@($script:events.ToArray());$script:events.Clear()
 $results.Add($routeResult)
 $results.ToArray()|ConvertTo-Json -Depth 30|Set-Content (Join-Path $out 'routes.json') -Encoding UTF8
 Write-Output "$route [$role] $($routeResult.viewports[0].h1)"
}
$ws.Dispose()
