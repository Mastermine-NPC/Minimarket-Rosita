import { readFile, writeFile } from 'node:fs/promises';
const tokens=JSON.parse(await readFile(new URL('../src/design/registry.json',import.meta.url),'utf8'));
const original=await readFile(new URL('../src/styles/tokens.css',import.meta.url),'utf8');
const css='/* Generated from src/design/registry.json. Run npm run tokens:generate. */\n:root {\n'+tokens.filter(t=>t.key!=='ds-button-variant').map(t=>`  --${t.key}: ${t.default}${t.unit};`).join('\n')+'\n  --brand: var(--primary);\n  --rose: var(--accent);\n  --motion-home-reveal: 650ms;\n  --motion-home-mask: 800ms;\n  --motion-marquee: 26s;\n}\n';
if(process.argv.includes('--check')){if(original!==css)throw new Error('Tokens CSS desactualizados.');}else await writeFile(new URL('../src/styles/tokens.css',import.meta.url),css);
