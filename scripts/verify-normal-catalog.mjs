import { createServer } from 'vite';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const load=p=>server.ssrLoadModule('/src/'+p);
 const {initialState,emptyCheckout}=await load('data/demo.ts');
 const {prepareQuote}=await load('lib/order-transaction.ts');
 const {rositaReducer}=await load('app/state/reducer.ts');
 const {integrateModelCatalog}=await load('lib/model-catalog-update.ts');
 const {currentProducts}=await load('lib/catalog-state.ts');
 const {filterProducts}=await load('features/catalogo/catalog-logic.ts');
 const {readRositaState,writeRositaState}=await load('lib/storage.ts');
 const {stateSchema}=await load('lib/state-schema.ts');
 let legacy=structuredClone(initialState);legacy.modelCatalogRevision='rosita-four-glb-v1';
 const legacyId=p=>p.modelKey==='coca-cola-can'?'ROS-3D-COLA':p.modelKey==='nivea-aftershave'?'ROS-3D-NIVEA':p.modelKey==='sunsilk-shampoo'?'ROS-3D-SUNSILK':'ROS-3D-LAYS-'+p.modelKey.slice(5).toUpperCase();
 for(const p of legacy.products.filter(p=>p.modelKey)){
  const oldId=p.id;p.id=legacyId(p);p.code=p.id;delete p.featured;
  legacy.inventory[p.id]=legacy.inventory[oldId];delete legacy.inventory[oldId];
 }
 legacy.inventory['ROS-3D-COLA']={priceCents:987,stock:6};legacy.cart={'ROS-3D-COLA':2};
 legacy.cashDrafts[legacy.users.find(u=>u.role==='cashier').id]={token:'legacy-cash',revision:2,cart:{'ROS-3D-COLA':1}};
 legacy.sessionUserId=legacy.users.find(user=>user.role==='customer').id;
 legacy.checkout={...emptyCheckout(),token:'legacy-order',step:2,delivery:{mode:'pickup',recipient:'Cliente Prueba',phone:'999123456',address:'Tienda Rosita',zone:'pickup',reference:'',origin:structuredClone(legacy.storeLocation)},payment:{method:'cash',cashAmount:'1000'}};
 const quote=prepareQuote(legacy);assert(quote.quote,quote.error);legacy.checkout.quote=quote.quote;
 legacy=rositaReducer(legacy,{type:'order/confirm',id:'ROS-LEGACY-ORDER',token:'legacy-order',createdAt:'2026-11-01T22:00:00.000Z'});
 assert.equal(legacy.orders.length,1);assert.equal(legacy.orders[0].lines[0].productId,'ROS-3D-COLA');assert.equal(legacy.movements.length,1);
 legacy.cart={'ROS-3D-COLA':1};
 const before=structuredClone(legacy);const migrated=integrateModelCatalog(legacy);
 assert(stateSchema.safeParse(migrated).success);
 assert.deepEqual(legacy,before);
 assert.equal(migrated.products.length,75);
 for(const key of ['inventory','cart','orders','movements','checkout','sales','shifts','cashDrafts','tracking'])assert.deepEqual(migrated[key],before[key],key+' must retain canonical references');
 assert.equal(migrated.products.find(p=>p.id==='ROS-3D-COLA').code,'ROS-064');
 assert(migrated.products.every(p=>!p.code?.startsWith('ROS-3D')));
 assert.equal(integrateModelCatalog(migrated),migrated);
 let raw=JSON.stringify({version:9,data:before});const storage={getItem:()=>raw,setItem:(_k,v)=>raw=v};
 const loaded=readRositaState(storage);assert.equal(loaded.status,'migrated');assert(writeRositaState(loaded.data,storage).ok);assert.equal(readRositaState(storage).status,'loaded');assert.deepEqual(readRositaState(storage).data.inventory,before.inventory);
 const all=currentProducts(migrated);
 for(const product of all){const routed=all.find(p=>p.id===product.publicId)||all.find(p=>p.code===product.publicId);assert.equal(routed?.id,product.id,'Every ordinary product URL must resolve to itself');}
 const catalog=filterProducts(all,new URLSearchParams());
 for(const key of ['coca-cola-can','nivea-aftershave','sunsilk-shampoo'])assert(catalog.slice(0,12).some(p=>p.modelKey===key),'Ordinary featured assortment includes '+key);
 assert(catalog.slice(0,12).some(p=>p.id==='ROS-002'));
 for(const name of ['Coca-Cola',"Lay's",'Nivea','Sunsilk'])assert(filterProducts(currentProducts(migrated),new URLSearchParams({q:name})).some(p=>p.modelKey||p.id==='ROS-002'));
 assert.equal(filterProducts(currentProducts(migrated),new URLSearchParams({q:'ROS-3D'})).length,0);
 const conflict=structuredClone(before);conflict.products.push({...conflict.products[0],id:'USER-ARTICLE',code:'ROS-064',barcode:'USER-ARTICLE'});conflict.inventory['USER-ARTICLE']={stock:2,priceCents:123};const result=integrateModelCatalog(conflict);assert.equal(result.products.find(p=>p.id==='USER-ARTICLE').code,'ROS-064');assert.notEqual(result.products.find(p=>p.modelKey==='coca-cola-can').code,'ROS-064');assert(stateSchema.safeParse(result).success);
 const report={passed:['One shared 75-product catalog without query parameters','Four ordinary featured references within the first 12 cards','Normal name search; legacy code search unnecessary and no longer matches public codes','Legacy IDs kept as canonical foreign keys; inventory, cart, checkout, orders and cash drafts unchanged','Normal public numeric codes and idempotent persisted migration','Occupied commercial codes preserve the prior record'],first12:catalog.slice(0,12).map(p=>({id:p.id,code:p.code,name:p.name}))};
 await fs.writeFile('docs/normal-catalog-verification/data-results.json',JSON.stringify(report,null,2));console.log(report);
}finally{await server.close()}
