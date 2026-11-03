import { createServer } from 'vite';
import assert from 'node:assert/strict';
const server=await createServer({root:process.cwd(),server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
try{
 const load=p=>server.ssrLoadModule('/src/'+p);
 const {phoneProblem,normalizePhone,phoneCountries}=await load('lib/phone.ts'),{deliverySchema}=await load('lib/checkout-validation.ts'),{initialState,emptyCheckout}=await load('data/demo.ts'),{rositaReducer:r}=await load('app/state/reducer.ts'),{stateSchema}=await load('lib/state-schema.ts'),{storeOrigin}=await load('data/geography.ts');
 const cases=[['999 123 456','PE','mobile','+51999123456'],['01 234 5678','PE','fixed','+5112345678'],['+44 20 7946 0958','GB','fixed','+442079460958'],['+1 415 555 2671','US','mobile','+14155552671'],['612345678','ES','mobile','+34612345678']];
 for(const[value,country,type,expected]of cases){assert.equal(phoneProblem(value,country,type),null);assert.equal(normalizePhone(value,country),expected)}
 for(const[value,country,type]of [['123','PE','other'],['+51 999','PE','mobile'],['hello +51999123456','PE','mobile'],['+44 20 7946 0958','GB','mobile'],['+51 999123456','PE','fixed'],['+51 999123456','ZZ','other']])assert(phoneProblem(value,country,type));
 for(const[value,country,type,expected]of cases){
  let state=structuredClone(initialState);state.sessionUserId=state.users.find(u=>u.role==='customer').id;state.cart={'ROS-001':1};state.checkout={...emptyCheckout(),token:crypto.randomUUID()};const inventory=structuredClone(state.inventory);
  const delivery={mode:'pickup',recipient:'Cliente internacional',phone:value,phoneCountry:country,phoneType:type,address:'Tienda Rosita',reference:'',zone:'pickup',origin:storeOrigin};const parsed=deliverySchema.safeParse(delivery);assert(parsed.success);assert.equal(parsed.data.phone,expected);
  state=r(state,{type:'checkout/delivery',delivery});assert.equal(state.checkout.delivery.phone,expected);assert.equal(state.checkout.step,1);state=r(state,{type:'checkout/payment',payment:{method:'cash',cashAmount:'100'}});assert(state.checkout.quote);assert.equal(state.checkout.step,2);const created=r(state,{type:'order/confirm',id:'ROS-PHONE-'+country,token:state.checkout.token,createdAt:new Date().toISOString()});assert.equal(created.orders.length,state.orders.length+1);assert.equal(created.orders[0].delivery.phone,expected);assert.equal(created.orders[0].delivery.phoneType,type);assert.equal(created.orders[0].delivery.phoneCountry,country);
  const restored=stateSchema.parse(JSON.parse(JSON.stringify(created)));assert.equal(restored.orders[0].delivery.phone,expected);assert.deepEqual(state.inventory,inventory,'Validation leaves inventory intact');
  const legacy=structuredClone(restored);legacy.orders[0].delivery.phone='999123456';delete legacy.orders[0].delivery.phoneCountry;delete legacy.orders[0].delivery.phoneType;assert.equal(stateSchema.parse(legacy).orders[0].delivery.phone,'999123456','Historical number is not rewritten');
 }
 const fs=await import('node:fs');for(const c of phoneCountries)assert(fs.existsSync(`public/images/flags/${c.code}.svg`));console.log(`PASS international mobile/fixed validation and normalization, type mismatch, incomplete numbers, reducer/order persistence, historical records and ${phoneCountries.length} local flags`);
}finally{await server.close()}
