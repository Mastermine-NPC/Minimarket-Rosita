import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const rgb=hex=>hex.match(/\w\w/g).map(value=>parseInt(value,16));
const lum=values=>values.map(value=>{const n=value/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
// White is the lightest possible backdrop under the card's 91%-opaque dark fill.
const card=rgb('0a1927').map(value=>value*.91+255*.09);
const results=[['Title / price','eff8fc',card,4.5],['Secondary metadata','c2d3df',card,4.5],['Stock','86ebcb',card,4.5],['Button text','102b35',rgb('80e4e3'),4.5],['Disabled label','d2dee6',rgb('304653'),4.5],['Indicator on page','168f96',rgb('f1f2e9'),3]].map(([name,foreground,background,minimum])=>({name,ratio:Number(ratio(rgb(foreground),background).toFixed(2)),minimum}));
for(const result of results)assert(result.ratio>=result.minimum,result.name);await fs.writeFile('docs/ux-card-verification/contrast-results.json',JSON.stringify(results,null,2));console.log(results);
