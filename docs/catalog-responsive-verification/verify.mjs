import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.VERIFICATION_OUT||'docs/catalog-responsive-verification/screenshots';
const before=process.env.BEFORE==='1';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.goto('http://localhost:4190/catalogo');await page.locator('.product-card').first().waitFor();
const results=[];
for(const [width,height] of [[320,740],[390,844],[480,800],[485,800],[486,800],[487,800],[600,800],[719,811],[768,1024],[900,720],[1001,667],[1023,768],[1024,768],[1117,703],[1280,600],[1373,713],[1440,900],[1727,927],[1920,1080],[2291,1301],[2560,1440],[3107,1703],[3840,2160]]){
 await page.setViewportSize({width,height});await page.mouse.move(width-3,height-3);await page.waitForTimeout(850);
 await page.locator('.catalog-layout').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-60,behavior:'instant'}));await page.waitForTimeout(250);
 const state=await page.evaluate(()=>{
  const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};
  const sidebar=document.querySelector('.filter-sidebar'),grid=document.querySelector('.catalog-products'),cards=[...grid.children],first=cards[0].getBoundingClientRect();
  return{viewport:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,container:rect(document.querySelector('.catalog-page')),grid:rect(grid),columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,card:rect(cards[0]),count:cards.length,firstRow:cards.filter(el=>Math.abs(el.getBoundingClientRect().top-first.top)<2).map(rect),sidebar:rect(sidebar),filters:rect(sidebar?.querySelector('.catalog-filters')),innerScroll:sidebar?{client:sidebar.clientHeight,scroll:sidebar.scrollHeight}:null,headerOpen:document.querySelector('.navigation-discover').getAttribute('aria-expanded'),imageFit:getComputedStyle(document.querySelector('.product-image')).objectFit};
 });results.push({width,height,...state});
 if(!before){assert(state.overflow<=1,`Horizontal overflow at ${width}: ${state.overflow}`);assert.equal(state.headerOpen,'false');assert(state.card.width>=210||width<350,`Narrow card ${width}`);assert(state.card.width<=455,`Stretched card ${width}`);assert.equal(state.firstRow.length,state.columns);assert(Math.abs(state.firstRow.at(-1).x+state.card.width-state.grid.x-state.grid.width)<2,'Grid fills available width');if(width>=1024){assert(state.sidebar.width>=280,'Sidebar is comfortable');assert(state.filters.width>=230,'Filter controls not double-padded');}else assert.equal(state.sidebar,null);}
 if([390,768,1024,1440,1920,2560,3840].includes(width))await page.screenshot({path:`${out}/${width}x${height}.png`});
}
await fs.writeFile(`${out}/measurements.json`,JSON.stringify({results,errors},null,2));
assert.deepEqual(errors,[]);await browser.close();console.log(before?'Before recorded':'Responsive widths passed',results.map(r=>[r.width,r.columns,Math.round(r.card.width),Math.round(r.sidebar?.width||0)]));
