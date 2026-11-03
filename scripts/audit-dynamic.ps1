param([string]$Phase='after-dynamic',[string]$Repo='\\wsl.localhost\Ubuntu\home\hisok\Desktop\extension-cor\PROYECTO-PROTOTIPO')
. "$PSScriptRoot/audit-browser-common.ps1"
Set-Viewport 1440 900;Navigate '/catalogo'
$dynamic=Eval-JS "(async()=>{const {data:s}=await fetch('/__audit-fixture/guest').then(r=>r.json());return [...s.products.filter(p=>p.active&&!p.archived).map(p=>({path:'/producto/'+p.id,kind:'product'})),...s.categories.filter(c=>c.active).map(c=>({path:'/categoria/'+c.slug,kind:'category'})),...s.subcategories.filter(c=>c.active).map(c=>({path:'/categoria/'+s.categories.find(p=>p.id===c.category).slug+'?subcategoria='+c.id,kind:'subcategory'}))]})()"
Eval-JS "(async()=>{const fixture=await fetch('/__audit-fixture/guest').then(r=>r.json());localStorage.setItem('minimarket-rosita:app',JSON.stringify(fixture));sessionStorage.setItem('minimarket-rosita:tab-session','null');return true})()"|Out-Null
$results=New-Object System.Collections.Generic.List[object]
foreach($route in $dynamic){
 Navigate $route.path
 if($route.kind -eq 'product'){
  for($i=0;$i -lt 100;$i++){
   $status=Eval-JS "document.querySelector('[data-model-state]')?.getAttribute('data-model-state')||'none'"
   if($status -ne 'loading'){break}
   Start-Sleep -Milliseconds 100
  }
 }
 foreach($width in @(320,1440)){
  Set-Viewport $width 900;Start-Sleep -Milliseconds 60
  $value=Eval-JS "({path:location.pathname+location.search,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.title,h1:document.querySelector('h1')?.innerText,products:document.querySelectorAll('.catalog-products .product-card').length,model:document.querySelector('[data-model-state]')?.getAttribute('data-model-state'),errors:[...document.querySelectorAll('[role=alert]')].map(e=>e.innerText)})"
  $results.Add($value)
 }
 $results.ToArray()|ConvertTo-Json -Depth 20|Set-Content (Join-Path $out 'routes.json') -Encoding UTF8
 Write-Output $route.path
}
$script:events.ToArray()|ConvertTo-Json -Depth 30|Set-Content (Join-Path $out 'events.json') -Encoding UTF8
$ws.Dispose()
