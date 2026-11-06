import { createServer } from 'node:http';
import { readFile, writeFile, rename, mkdir, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname, dirname, sep } from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateTheme, contrastIssues } from '../src/design/validation.mjs';
const registry=JSON.parse(await readFile(new URL('../src/design/registry.json',import.meta.url),'utf8'));
const defaults=Object.fromEntries(registry.map(t=>[t.key,t.default]));
const root=resolve(fileURLToPath(new URL('../dist',import.meta.url)));
const file=resolve(process.env.ROSITA_DESIGN_FILE || '.runtime/design-system.json');
if(file.startsWith(root+sep))throw new Error('La configuración privada debe estar fuera de dist.');
const port=Number(process.env.PORT || 4191);
const origin=new URL(process.env.ROSITA_APP_ORIGIN || `http://localhost:${port}`).origin;
const secret=process.env.ROSITA_DESIGN_ADMIN_PASSWORD;
if(secret && secret.length<16)throw new Error('ROSITA_DESIGN_ADMIN_PASSWORD requiere al menos 16 caracteres.');
const salt=randomBytes(32), passwordHash=secret?scryptSync(secret,salt,64):null;
const sessions=new Map(), attempts=new Map();
let queue=Promise.resolve();
const json=(response,status,data,headers={})=>{response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});response.end(JSON.stringify(data));};
const fail=(status,message)=>Object.assign(new Error(message),{status});
async function load(){
  try{const saved=JSON.parse(await readFile(file,'utf8'));saved.values=validateTheme(saved.values,registry);if(!Number.isInteger(saved.revision)||saved.revision<1||!Array.isArray(saved.audit))throw new Error('Formato inválido');return saved;}
  catch(error){if(error.code==='ENOENT')return {revision:0,updatedAt:null,values:defaults,audit:[]};throw fail(503,'La configuración persistente no está disponible. No se ha sobrescrito.');}
}
async function body(request){let raw='';for await(const chunk of request){raw+=chunk;if(Buffer.byteLength(raw)>65536)throw fail(413,'Solicitud demasiado grande.');}try{const value=JSON.parse(raw);if(!value||typeof value!=='object'||Array.isArray(value))throw new Error();return value;}catch{throw fail(400,'JSON inválido.');}}
function session(request){
 const token=request.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith('rosita_design='))?.slice(14);
 const found=token&&sessions.get(token);
 if(!found||found.expires<Date.now()){if(token)sessions.delete(token);return null;}return {...found,token};
}
const cookie=(token,age=28800)=>`rosita_design=${token}; HttpOnly; SameSite=Strict; Path=/api/design; Max-Age=${age}${origin.startsWith('https:')?'; Secure':''}`;
async function api(request,response,path){
 const method=request.method;
 if(path==='/api/design/theme'&&method==='GET'){const saved=await load();return json(response,200,{revision:saved.revision,updatedAt:saved.updatedAt,values:saved.values});}
 if(path==='/api/design/session'&&method==='GET'){const user=session(request);return json(response,200,{configured:!!secret,authenticated:!!user,csrf:user?.csrf??null});}
 if(!['POST','PUT','DELETE'].includes(method))throw fail(404,'Recurso no encontrado.');
 if(request.headers.origin!==origin)throw fail(403,'Origen no autorizado.');
 if(path==='/api/design/session'&&method==='POST'){
  if(!passwordHash)throw fail(503,'Publicación deshabilitada: falta configurar la credencial administrativa del servidor.');
  const key=request.socket.remoteAddress;
  // Bounded memory; expired entries do not accumulate.
  for(const [ip,value] of attempts)if(value.until<Date.now())attempts.delete(ip);
  if(attempts.size>10000)throw fail(429,'Demasiadas solicitudes.');
  const attempt=attempts.get(key)||{count:0,until:Date.now()+900000};
  if(attempt.count>=8)throw fail(429,'Demasiados intentos. Intenta más tarde.');
  attempt.count++;attempts.set(key,attempt);
  const data=await body(request);
  if(typeof data.password!=='string'||data.password.length>512||!timingSafeEqual(scryptSync(data.password,salt,64),passwordHash))throw fail(401,'Credencial incorrecta.');
  attempts.delete(key);
  for(const [id,value] of sessions)if(value.expires<Date.now())sessions.delete(id);
  if(sessions.size>=1000)throw fail(429,'Demasiadas sesiones.');
  const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');sessions.set(token,{csrf,expires:Date.now()+28800000});
  return json(response,200,{authenticated:true,configured:true,csrf},{'Set-Cookie':cookie(token)});
 }
 const user=session(request);
 if(!user)throw fail(401,'Se requiere una sesión administrativa del servidor.');
 if(request.headers['x-csrf-token']!==user.csrf)throw fail(403,'Token de seguridad inválido.');
 if(path==='/api/design/session'&&method==='DELETE'){sessions.delete(user.token);return json(response,200,{authenticated:false},{'Set-Cookie':cookie('',0)});}
 if(path==='/api/design/theme'&&method==='PUT'){
  const data=await body(request);let values;try{values=validateTheme(data.values,registry,true);}catch(error){throw fail(422,error.message);}
  // Validate linked semantic colors after resolving the same defaults used by the client.
  const effective={...values};for(const t of registry)if(t.source&&values[t.key]===t.default&&values[t.source]!==defaults[t.source])effective[t.key]=values[t.source];
  const issues=contrastIssues(effective);if(issues.length)throw fail(422,issues.join('; '));
  const operation=queue.then(async()=>{
   const previous=await load();if(data.revision!==previous.revision)throw fail(409,'Otra publicación cambió la configuración. Recarga la versión publicada antes de guardar.');
   const updatedAt=new Date().toISOString();
   const audit=[...previous.audit,{revision:previous.revision+1,at:updatedAt,actor:'design-administrator',keys:registry.filter(t=>values[t.key]!==previous.values[t.key]).map(t=>t.key)}].slice(-100);
   const saved={revision:previous.revision+1,updatedAt,values,audit};
   await mkdir(dirname(file),{recursive:true,mode:0o700});const temporary=file+'.tmp';await writeFile(temporary,JSON.stringify(saved,null,2),{mode:0o600});await rename(temporary,file);
   return {revision:saved.revision,updatedAt,values};
  });queue=operation.catch(()=>{});return json(response,200,await operation);
 }
 throw fail(404,'Recurso no encontrado.');
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm','.glb':'model/gltf-binary','.ico':'image/x-icon','.txt':'text/plain','.xml':'application/xml'};
const server=createServer(async(request,response)=>{
 try{
  const url=new URL(request.url,origin);if(url.pathname.startsWith('/api/'))return await api(request,response,url.pathname);
  if(!['GET','HEAD'].includes(request.method))throw fail(405,'Método no permitido.');
  const pathname=decodeURIComponent(url.pathname);let target=resolve(root,'.'+pathname);
  if((target!==root&&!target.startsWith(root+sep))||pathname.split('/').some(part=>part.startsWith('.')))throw fail(404,'No encontrado.');
  let info;try{info=await stat(target);if(!info.isFile())throw new Error();}catch{if(extname(pathname))throw fail(404,'No encontrado.');target=resolve(root,'index.html');info=await stat(target);}
  const headers={'Content-Type':mime[extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','Cache-Control':target.includes(sep+'assets'+sep)?'public, max-age=31536000, immutable':'no-cache'};
  let start=0,end=info.size-1,status=200;
  if(request.headers.range){const range=/^bytes=(\d*)-(\d*)$/.exec(request.headers.range);if(!range)throw fail(416,'Rango inválido.');start=range[1]?Number(range[1]):Math.max(0,info.size-Number(range[2]));end=range[1]&&range[2]?Math.min(Number(range[2]),end):end;if(start>end||start>=info.size){response.writeHead(416,{'Content-Range':`bytes */${info.size}`});return response.end();}status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;}
  response.writeHead(status,{...headers,'Content-Length':end-start+1});if(request.method==='HEAD')return response.end();createReadStream(target,{start,end}).on('error',()=>response.destroy()).pipe(response);
 }catch(error){if(!response.headersSent)json(response,error.status||500,{error:error.status?error.message:'No se pudo completar la solicitud.'});else response.destroy();}
});
server.requestTimeout=15000;server.headersTimeout=10000;
server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Rosita: ${origin} · configuración global ${secret?'habilitada':'solo lectura, sin credencial de servidor'}`));
