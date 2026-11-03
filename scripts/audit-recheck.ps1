param([string]$Phase='final-recheck',[string]$Repo='\\wsl.localhost\Ubuntu\home\hisok\Desktop\extension-cor\PROYECTO-PROTOTIPO')
. "$PSScriptRoot/audit-browser-common.ps1"
Set-Viewport 1440 900;Navigate '/categoria/consumibles?subcategoria=cereales'
$results=New-Object System.Collections.Generic.List[object]
foreach($size in @(@(320,568),@(375,667),@(390,844),@(430,932),@(768,1024),@(1024,768),@(1280,720),@(1440,900),@(1920,1080))){
 Set-Viewport $size[0] $size[1];Start-Sleep -Milliseconds 60
 $value=Eval-JS "({path:location.pathname+location.search,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.innerText,title:document.title,canonical:document.querySelectorAll('link[rel=canonical]').length,descriptions:document.querySelectorAll('meta[name=description]').length,products:document.querySelectorAll('.catalog-products .product-card').length,distortedAtlas:[...document.querySelectorAll('.product-card .product-image:not(.product-illustration)')].filter(e=>Math.abs(e.getBoundingClientRect().width-e.getBoundingClientRect().height)>1).length})"
 $results.Add($value)
}
$robots=Eval-JS "(async()=>({status:(await fetch('/robots.txt')).status,pageStatus:(await fetch(location.href)).status}))()"
$results.Add($robots)
Send-CDP 'Accessibility.enable'|Out-Null
$ax=Send-CDP 'Accessibility.getFullAXTree'
$results.Add(@{checkboxAccessibleNames=@($ax.nodes|Where-Object {$_.role.value -eq 'checkbox'}|ForEach-Object {$_.name.value})})
$results.ToArray()|ConvertTo-Json -Depth 20|Set-Content (Join-Path $out 'checks.json') -Encoding UTF8
$script:events.ToArray()|ConvertTo-Json -Depth 30|Set-Content (Join-Path $out 'events.json') -Encoding UTF8
$ws.Dispose()
