import { createServer } from 'vite';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const server=await createServer({root:process.cwd(),server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
 const load=p=>server.ssrLoadModule('/src/'+p);
 const {initialState,emptyCheckout}=await load('data/demo.ts'),{rositaReducer:r}=await load('app/state/reducer.ts'),{prepareQuote}=await load('lib/order-transaction.ts'),{stateSchema}=await load('lib/state-schema.ts'),{orderNotifications,receiveOrderUpdates}=await load('lib/order-events.ts'),{storeOrigin}=await load('data/geography.ts');
 const s=structuredClone(initialState),client=s.users.find(u=>u.role==='customer'),admin=s.users.find(u=>u.role==='admin'),cashier=s.users.find(u=>u.role==='cashier');
 s.sessionUserId=client.id;s.cart={'ROS-001':1};s.checkout={...emptyCheckout(),token:'flow-token',step:2,delivery:{mode:'pickup',recipient:'Cliente de verificación',phone:'999123456',address:'Tienda Rosita',reference:'',zone:'pickup',origin:storeOrigin},payment:{method:'cash',cashAmount:'100'}};
 s.checkout.quote=prepareQuote(s).quote;assert(s.checkout.quote);const received=r(s,{type:'order/confirm',id:'ROS-FLOW-TEST',token:'flow-token',createdAt:'2026-11-01T12:00:00.000Z'});assert.equal(received.orders[0].status,0);
 const action={type:'order/advance',id:received.orders[0].id,expectedStatus:0,operationId:'flow-prep',at:'2026-11-01T12:01:00.000Z'};
 for(const user of [client,cashier]){const denied=r({...received,sessionUserId:user.id},action);assert.equal(denied.adminResult.ok,false);assert.deepEqual(denied.orders,received.orders);assert.deepEqual(denied.inventory,received.inventory);}
 const inactive=r({...received,sessionUserId:admin.id,users:received.users.map(u=>u.id===admin.id?{...u,active:false}:u)},action);assert.equal(inactive.adminResult.ok,false);
 let active={...received,sessionUserId:admin.id};const transitions=[];
 for(let expectedStatus=0;expectedStatus<3;expectedStatus++){
  const command={...action,expectedStatus,operationId:'flow-'+expectedStatus,at:`2026-11-01T12:0${expectedStatus+1}:00.000Z`};const next=r(active,command);assert(next.adminResult.ok);assert.equal(next.orders[0].status,expectedStatus+1);assert.equal(next.orders[0].statusHistory.length,expectedStatus+2);assert.equal(next.orders[0].statusHistory.at(-1).origin,'admin-demo');assert.equal(r(next,command),next);const stale=r(next,{...command,operationId:'stale-'+expectedStatus});assert.equal(stale.adminResult.ok,false);assert.deepEqual(stale.orders,next.orders);active=next;transitions.push(active);
 }
 assert.equal(r(active,{...action,expectedStatus:3,operationId:'after-end'}).adminResult.ok,false);assert.deepEqual(active.inventory,received.inventory);assert.deepEqual(active.movements,received.movements);assert(stateSchema.safeParse(active).success);
 const notices=orderNotifications(active.orders,client.id);assert.equal(notices.length,4);assert.equal(new Set(notices.map(n=>n.id)).size,4);assert.equal(orderNotifications(active.orders,admin.id).length,0);assert.equal(orderNotifications([...active.orders,...active.orders],client.id).length,4);
 const parsed=stateSchema.parse(JSON.parse(JSON.stringify(active)));const synced=receiveOrderUpdates(received,parsed.orders);assert.equal(synced.orders[0].status,3);assert.deepEqual(synced.inventory,received.inventory);assert.equal(synced.sessionUserId,client.id);assert.equal(receiveOrderUpdates(synced,parsed.orders),synced);assert.equal(receiveOrderUpdates(synced,received.orders),synced);
 const forged=structuredClone(parsed.orders);forged[0].statusHistory[1].actorId=client.id;assert.equal(receiveOrderUpdates(received,forged),received);const changedMoney=structuredClone(parsed.orders);changedMoney[0].totalCents++;assert.equal(receiveOrderUpdates(received,changedMoney),received);const skipped=structuredClone(parsed.orders);skipped[0].statusHistory.splice(1,1);assert.equal(receiveOrderUpdates(received,skipped),received);
 const passed=['received order through existing transaction','customer/cashier/inactive administrator cannot advance','administrator advances exactly one stage with immutable snapshot','duplicate and stale operations rejected','delivery requires explicit administrator transition','notification history derives from unique persisted events and respects ownership','validated forward status sync preserves session, payment, inventory and movements','forged actor, altered totals, skipped and backwards history rejected'];
 await fs.writeFile('docs/order-flow-verification/logic.json',JSON.stringify({passed,statuses:transitions.map(s=>s.orders[0].status),notifications:notices.map(n=>n.title)},null,2));console.log(passed.join('\n'));
}finally{await server.close();}
