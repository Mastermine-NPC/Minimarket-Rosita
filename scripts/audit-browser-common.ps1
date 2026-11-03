$ErrorActionPreference='Stop'
if(!$Base){$Base='http://localhost:5197'}
$out=Join-Path $Repo "docs\integral-audit\$Phase"
New-Item -ItemType Directory -Force $out | Out-Null
$auditProfile=Join-Path $env:TEMP 'rosita-integral-audit-isolated'
$browser=Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList @('--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=9238',"--user-data-dir=$auditProfile",'--use-angle=swiftshader','--enable-unsafe-swiftshader','about:blank') -PassThru
Start-Sleep -Milliseconds 1000
$target=$null
for($attempt=0;$attempt -lt 30 -and !$target;$attempt++){
 try { $tabs=Invoke-RestMethod 'http://127.0.0.1:9238/json/list'; foreach($tab in $tabs){if($tab.type -eq 'page'){$target=$tab;break}} } catch {}
 if(!$target){Start-Sleep -Milliseconds 200}
}
if(!$target){throw 'No isolated Chrome page available'}
$script:ws=New-Object System.Net.WebSockets.ClientWebSocket
$ws.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
$script:counter=0
$script:events=New-Object System.Collections.Generic.List[object]
function Send-CDP([string]$method,$params=@{}) {
 $script:counter++;$id=$script:counter
 $json=@{id=$id;method=$method;params=$params}|ConvertTo-Json -Depth 40 -Compress
 $bytes=[Text.Encoding]::UTF8.GetBytes($json)
 $ws.SendAsync([ArraySegment[byte]]::new($bytes),[Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult()|Out-Null
 while($true){
  $buffer=New-Object byte[] 1048576;$stream=New-Object IO.MemoryStream
  do{$cts=New-Object Threading.CancellationTokenSource(30000);$received=$ws.ReceiveAsync([ArraySegment[byte]]::new($buffer),$cts.Token).GetAwaiter().GetResult();$stream.Write($buffer,0,$received.Count);$cts.Dispose()}while(!$received.EndOfMessage)
  $message=[Text.Encoding]::UTF8.GetString($stream.ToArray())|ConvertFrom-Json;$stream.Dispose()
  if($message.id -eq $id){if($message.error){throw ($message.error|ConvertTo-Json)};return $message.result}
  if(($message.method -in @('Runtime.exceptionThrown','Log.entryAdded','Network.loadingFailed')) -or ($message.method -eq 'Network.responseReceived' -and $message.params.response.status -ge 400)){$script:events.Add($message)}
 }
}
function Eval-JS([string]$expression){
 $result=Send-CDP 'Runtime.evaluate' @{expression=$expression;awaitPromise=$true;returnByValue=$true;userGesture=$true}
 if($result.exceptionDetails){throw ($result.exceptionDetails|ConvertTo-Json -Depth 10)}
 return $result.result.value
}
function Navigate([string]$route){
 Send-CDP 'Page.navigate' @{url="$Base$route"}|Out-Null
 for($i=0;$i -lt 100;$i++){
  Start-Sleep -Milliseconds 100
  $ready=Eval-JS "document.readyState==='complete' && !!document.querySelector('#root h1') && !document.querySelector('.route-loading')"
  if($ready){break}
 }
 Start-Sleep -Milliseconds 180
}
function Set-Viewport([int]$w,[int]$h){Send-CDP 'Emulation.setDeviceMetricsOverride' @{width=$w;height=$h;deviceScaleFactor=1;mobile=$false}|Out-Null}
function Screenshot([string]$name){$shot=Send-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false};[IO.File]::WriteAllBytes((Join-Path $out "$name.png"),[Convert]::FromBase64String($shot.data))}
Send-CDP 'Page.enable'|Out-Null;Send-CDP 'Runtime.enable'|Out-Null;Send-CDP 'Log.enable'|Out-Null;Send-CDP 'Network.enable'|Out-Null
Send-CDP 'Emulation.setEmulatedMedia' @{features=@(@{name='prefers-reduced-motion';value='reduce'})}|Out-Null
