import { createServer as viteServer } from 'vite';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
const vite=await viteServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
const load=p=>vite.ssrLoadModule('/src/'+p);
const {initialState,emptyCheckout}=await load('data/demo.ts');
const {rositaReducer:r}=await load('app/state/reducer.ts');
const {prepareQuote}=await load('lib/order-transaction.ts');
const {storeOrigin}=await load('data/geography.ts');
const {stateSchema}=await load('lib/state-schema.ts');
let state=structuredClone(initialState);
const customer=state.users.find(u=>u.role==='customer'),admin=state.users.find(u=>u.role==='admin'),cashier=state.users.find(u=>u.role==='cashier');
state.sessionUserId=customer.id;state.cart={'ROS-001':1};
state.checkout={...emptyCheckout(),token:'audit-order-token',step:2,delivery:{mode:'pickup',recipient:'Cliente Auditoría',phone:'999123456',address:'Tienda Rosita',reference:'',zone:'pickup',origin:storeOrigin},payment:{method:'cash',cashAmount:'100'}};
state.checkout.quote=prepareQuote(state).quote;
state=r(state,{type:'order/confirm',id:'ROS-AUDIT-ORDER',token:'audit-order-token',createdAt:new Date().toISOString()});
state.cart={'ROS-001':1};state.checkout=emptyCheckout();state.sessionUserId=null;
stateSchema.parse(state);
const fixtures={guest:state,customer:{...state,sessionUserId:customer.id},admin:{...state,sessionUserId:admin.id},cashier:{...state,sessionUserId:cashier.id}};
await vite.close();
const root=path.resolve(process.env.AUDIT_DIST || 'dist');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webm':'video/webm','.mp4':'video/mp4','.glb':'model/gltf-binary','.woff2':'font/woff2'};
createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/__audit-fixture/')){const fixture=fixtures[url.pathname.split('/').pop()];if(!fixture){res.writeHead(404);res.end();return;}res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({version:9,data:fixture}));return;}
 let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
 let info=await stat(file).catch(()=>null);if(!info?.isFile()){file=path.join(root,'index.html');info=await stat(file);}
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');
 const range=/bytes=(\d+)-(\d*)/.exec(req.headers.range||'');
 if(range){const start=Number(range[1]),end=Math.min(Number(range[2]||info.size-1),info.size-1);if(start>end){res.writeHead(416);res.end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1});createReadStream(file,{start,end}).pipe(res);}
 else{res.setHeader('Content-Length',info.size);createReadStream(file).pipe(res);}
 }catch{res.writeHead(500);res.end('Audit server error');}
}).listen(Number(process.env.AUDIT_PORT || 5197),'0.0.0.0',()=>console.log('Isolated production audit: http://localhost:5197'));
