param([string]$Phase='performance-after',[string]$Only='',[string]$Base='http://localhost:5197',[string]$Repo='\\wsl.localhost\Ubuntu\home\hisok\Desktop\extension-cor\PROYECTO-PROTOTIPO')
. "$PSScriptRoot/audit-browser-common.ps1"
Send-CDP 'Emulation.setEmulatedMedia' @{features=@(@{name='prefers-reduced-motion';value='no-preference'})}|Out-Null
Send-CDP 'Network.setCacheDisabled' @{cacheDisabled=$true}|Out-Null
Send-CDP 'Performance.enable'|Out-Null
Send-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source=@'
window.__auditPerf={lcp:0,cls:0,staticUploads:0,videoUploads:0,shifts:[]};
try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__auditPerf.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput){window.__auditPerf.cls+=e.value;window.__auditPerf.shifts.push({value:e.value,time:e.startTime,sources:e.sources?.map(s=>({tag:s.node?.tagName,class:s.node?.className,previous:s.previousRect.toJSON(),current:s.currentRect.toJSON()}))})}}).observe({type:'layout-shift',buffered:true})}catch{}
const original=WebGLRenderingContext.prototype.texImage2D;WebGLRenderingContext.prototype.texImage2D=function(...args){const s=args.at(-1);if(s instanceof HTMLVideoElement)window.__auditPerf.videoUploads++;else if(s instanceof HTMLImageElement||s instanceof HTMLCanvasElement)window.__auditPerf.staticUploads++;return original.apply(this,args)};
'@}|Out-Null
Set-Viewport 1440 900
$results=New-Object System.Collections.Generic.List[object]
foreach($route in @('/catalogo','/','/producto/ROS-064','/producto/ROS-065','/producto/ROS-066','/producto/ROS-002','/producto/ROS-022')){
 if($Only -and $route -ne $Only){continue}
 Navigate $route
 if($route -like '/producto/*'){
  for($i=0;$i -lt 100;$i++){Start-Sleep -Milliseconds 100;$ready=Eval-JS "document.querySelector('[data-model-state]')?.getAttribute('data-model-state')==='ready' || !!document.querySelector('.product-3d-fallback')";if($ready){break}}
 }
 Start-Sleep -Milliseconds 2500
 $value=Eval-JS "({...window.__auditPerf,path:location.pathname,model:document.querySelector('[data-model-state]')?.getAttribute('data-model-state'),videos:[...document.querySelectorAll('video')].map(v=>({source:v.currentSrc,paused:v.paused,ready:v.readyState})),resourceBytes:performance.getEntriesByType('resource').reduce((a,r)=>a+r.transferSize,0),load:performance.getEntriesByType('navigation')[0]?.loadEventEnd})"
 if($route -eq '/'){
  Eval-JS "document.querySelector('.home-featured-section').scrollIntoView({behavior:'instant',block:'center'})"|Out-Null
  Start-Sleep -Milliseconds 1200
  $before=Eval-JS "window.__auditPerf.staticUploads"
  Start-Sleep -Milliseconds 2000
  $after=Eval-JS "window.__auditPerf.staticUploads"
  $value|Add-Member -NotePropertyName stillUploadsInTwoSeconds -NotePropertyValue ($after-$before)
 }
 $results.Add($value);$results.ToArray()|ConvertTo-Json -Depth 20|Set-Content (Join-Path $out 'metrics.json') -Encoding UTF8
 Screenshot (($route -replace '[^a-zA-Z0-9-]','_')+'-motion')
 Write-Output ($value|ConvertTo-Json -Depth 4 -Compress)
}
$script:events.ToArray()|ConvertTo-Json -Depth 30|Set-Content (Join-Path $out 'events.json') -Encoding UTF8
$ws.Dispose()
