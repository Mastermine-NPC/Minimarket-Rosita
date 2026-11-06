import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { validateTheme, contrastIssues } from '../src/design/validation.mjs';
const registry=JSON.parse(await readFile(new URL('../src/design/registry.json',import.meta.url),'utf8'));
const defaults=Object.fromEntries(registry.map(t=>[t.key,t.default]));
assert.equal(new Set(registry.map(t=>t.key)).size,registry.length);
assert.deepEqual(validateTheme(defaults,registry,true),defaults);assert.deepEqual(contrastIssues(defaults),[]);
for(const value of ['url(javascript:alert(1))','#fff','red','</style><script>'])assert.throws(()=>validateTheme({...defaults,primary:value},registry,true));
assert.throws(()=>validateTheme({...defaults,'font-body':'url(https://bad.test)'},registry,true));
assert.throws(()=>validateTheme({...defaults,'ds-nav-height':'100000'},registry,true));
assert.throws(()=>validateTheme({...defaults,'unknown-token':'#000000'},registry,true));
const dir=await mkdtemp(join(tmpdir(),'rosita-design-')),file=join(dir,'theme.json');
const password=randomBytes(32).toString('hex'),port=Number(process.env.DESIGN_TEST_PORT||43191),origin=`http://127.0.0.1:${port}`;
let processHandle;
async function start(configured=true){processHandle=spawn(process.execPath,['server/design-server.mjs'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',ROSITA_APP_ORIGIN:origin,ROSITA_DESIGN_FILE:file,ROSITA_DESIGN_ADMIN_PASSWORD:configured?password:''},stdio:['ignore','pipe','pipe']});let logs='';processHandle.stderr.on('data',data=>logs+=data);for(let i=0;i<100;i++){if(processHandle.exitCode!==null)throw new Error(logs);try{await fetch(origin+'/api/design/session');return;}catch{await new Promise(resolve=>setTimeout(resolve,50));}}throw new Error('Servidor no disponible: '+logs);}
async function stop(){if(!processHandle)return;if(processHandle.exitCode!==null||processHandle.signalCode){processHandle=null;return;}const closed=new Promise(resolve=>processHandle.once('exit',resolve));processHandle.kill();await closed;processHandle=null;}
async function request(path,method='GET',data,headers={}){const response=await fetch(origin+'/api/design/'+path,{method,headers:{...(method!=='GET'?{'Content-Type':'application/json',Origin:origin}:{}),...headers},...(data!==undefined?{body:JSON.stringify(data)}:{})});return {status:response.status,data:await response.json(),headers:response.headers};}
try{
 await start();let initial=await request('theme');assert.equal(initial.status,200);assert.equal(initial.data.revision,0);assert.deepEqual(initial.data.values,defaults);
 assert.equal((await request('theme','PUT',{revision:0,values:defaults})).status,401);
 assert.equal((await request('session','POST',{password},{Origin:'https://outside.invalid'})).status,403);
 assert.equal((await request('session','POST',{password:'incorrect'})).status,401);
 const login=await request('session','POST',{password});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0],headers={Cookie:cookie,'X-CSRF-Token':login.data.csrf};assert(login.headers.get('set-cookie').includes('HttpOnly'));assert(login.headers.get('set-cookie').includes('SameSite=Strict'));
 assert.equal((await request('theme','PUT',{revision:0,values:defaults},{Cookie:cookie})).status,403);
 assert.equal((await request('theme','PUT',{revision:0,values:{...defaults,primary:'url(bad)'}},headers)).status,422);
 assert.equal((await request('theme','PUT',{revision:0,values:{...defaults,primary:'#ffffff'}},headers)).status,422);
 const next={...defaults,primary:'#224c70','radius-control':'18','font-body':'Georgia, serif','ds-button-variant':'outline'};
 const saved=await request('theme','PUT',{revision:0,values:next},headers);assert.equal(saved.status,200);assert.equal(saved.data.revision,1);
 const visitor=await request('theme');assert.deepEqual(visitor.data.values,next);assert(!('audit' in visitor.data));
 assert.equal((await request('theme','PUT',{revision:0,values:defaults},headers)).status,409);
 assert.equal((await fetch(origin+'/')).status,200);const staticPage=await fetch(origin+'/catalogo');assert.equal(staticPage.status,200);assert((await staticPage.text()).includes('id="root"'));
 const image=await fetch(origin+'/images/rosita-logo.png',{headers:{Range:'bytes=0-9'}});assert.equal(image.status,206);assert.equal((await image.arrayBuffer()).byteLength,10);
 assert.equal((await fetch(origin+'/src/design/registry.json')).status,404);
 await stop();await start();assert.deepEqual((await request('theme')).data.values,next);
 assert.equal((await request('theme','PUT',{revision:1,values:defaults},headers)).status,401);
 const second=await request('session','POST',{password});const secondHeaders={Cookie:second.headers.get('set-cookie').split(';')[0],'X-CSRF-Token':second.data.csrf};
 assert.equal((await request('theme','PUT',{revision:1,values:defaults},secondHeaders)).status,200);assert.deepEqual((await request('theme')).data.values,defaults);
 const disk=JSON.parse(await readFile(file,'utf8'));assert.equal(disk.audit.length,2);assert(disk.audit[0].keys.includes('primary'));assert(!JSON.stringify(disk).includes(password));
 assert.equal((await request('session','DELETE',undefined,secondHeaders)).status,200);assert.equal((await request('theme','PUT',{revision:2,values:next},secondHeaders)).status,401);
 const additive={...disk,values:{...disk.values}};delete additive.values['space-2xs'];await writeFile(file,JSON.stringify(additive));assert.equal((await request('theme')).data.values['space-2xs'],'2');
 await writeFile(file,'broken');assert.equal((await request('theme')).status,503);assert.equal(await readFile(file,'utf8'),'broken');await writeFile(file,JSON.stringify(disk));
 await stop();await start(false);assert.equal((await request('session','POST',{password})).status,503);assert.equal((await request('theme')).status,200);
 console.log(`PASS Design System: ${registry.length} tokens; validación, contraste, permisos reales, CSRF/origen, publicación, visitante independiente, conflictos, persistencia tras reinicio, restauración, auditoría, corrupción protegida, rangos estáticos y falta de credencial.`);
}finally{await stop();await rm(dir,{recursive:true,force:true});}
