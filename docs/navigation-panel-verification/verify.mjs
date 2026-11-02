import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const{chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const{expect}=await import(process.env.PLAYWRIGHT_EXPECT_MODULE||'playwright/test');
const base=process.env.BASE_URL||'http://localhost:4190',out=process.env.VERIFICATION_OUT||'docs/navigation-panel-verification/screenshots';await fs.mkdir(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader']});const results=[],errors=[];
for(const width of[1440,390]){
 const p=await browser.newPage({viewport:{width,height:1000},hasTouch:width<900});p.on('pageerror',error=>errors.push(error.message));const trigger=p.locator('.navigation-discover');
 const closed=async()=>{await expect(trigger).toHaveAttribute('aria-expanded','false');await p.waitForTimeout(800);await expect(trigger).toHaveAttribute('aria-expanded','false')};
 const activate=async()=>{if(width===1440){await p.mouse.move(width-5,700);await p.mouse.move(width/2,5);}else await trigger.tap();await expect(trigger).toHaveAttribute('aria-expanded','true');await p.waitForTimeout(700)};
 await p.goto(base+'/catalogo');await p.locator('h1').waitFor();await closed();await p.reload();await p.locator('h1').waitFor();await closed();
 await activate();if(width===1440){await p.mouse.move(450,105);await p.waitForTimeout(900);await expect(trigger).toHaveAttribute('aria-expanded','true');await p.mouse.move(width-5,700);await closed();await activate();}else{await p.waitForTimeout(900);await expect(trigger).toHaveAttribute('aria-expanded','true');await trigger.tap();await closed();await activate();}
 await p.screenshot({path:`${out}/open-${width}.png`});
 const visits=[];
 for(const category of['ferreteria','consumibles','tecnologia','cuidado-personal','educacion-oficina','jugueteria','ferreteria','consumibles']){
  if(await trigger.getAttribute('aria-expanded')==='false')await activate();
  if(width===1440){await p.locator(`.category-inline a[href="/categoria/${category}"]`).click();}else{await p.getByRole('button',{name:'Menú',exact:true}).tap();await p.locator(`.menu-category-links a[href="/categoria/${category}"]`).tap();}
  await expect(trigger).toHaveAttribute('aria-expanded','false');await p.waitForURL('**/categoria/'+category);await p.locator('h1').waitFor();await p.waitForTimeout(1400);await closed();assert.equal(await p.getByRole('dialog').count(),0);visits.push(category);console.log(width,category,"closed after navigation");
  if(width===1440){await p.mouse.move(450,100);await closed();}
 }
 await activate();if(width===1440)await p.locator('.main-links a[href="/"]').click();else await p.locator('.main-links a[href="/"]').tap();await expect(trigger).toHaveAttribute('aria-expanded','false');await p.waitForURL(base+'/');await p.locator('h1').waitFor();await p.waitForTimeout(1400);await closed();
 await activate();if(width===1440)await p.getByRole('button',{name:'Menú',exact:true}).click();else await p.getByRole('button',{name:'Menú',exact:true}).tap();await p.locator('.menu-sheet').getByRole('link',{name:'Nosotros',exact:true}).click();await expect(trigger).toHaveAttribute('aria-expanded','false');await p.waitForURL('**/nosotros');await p.waitForTimeout(1500);await closed();
 await p.evaluate(()=>document.querySelector('h1')?.focus());await closed();await p.evaluate(()=>scrollTo({top:600,behavior:'instant'}));await closed();await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await closed();
 await activate();await p.reload();await p.locator('h1').waitFor();await closed();
 if(width===1440){await activate();await p.goBack();await closed();await p.mouse.move(width/2,10);await closed();await p.mouse.move(width-5,700);await p.mouse.move(width/2,5);await expect(trigger).toHaveAttribute('aria-expanded','true');await trigger.focus();await p.keyboard.press('Escape');await closed();}
 await p.screenshot({path:`${out}/closed-${width}.png`});results.push({width,visits,passed:['initial entry and reload closed','top activation → panel crossing stays open','exit delay / touch toggle','navigation closes at click and stays closed after cinematic route load','all categories repeatedly including consumibles','Home and About via navigation','focus and former panel area do not reopen it','scroll does not open it','reload with pointer on activation strip stays closed',...(width===1440?['Back requires a fresh activation entry']:[])]});console.log(width,'navigation lifecycle passed');await p.close();
}
assert.deepEqual(errors,[]);await fs.writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));await browser.close();
