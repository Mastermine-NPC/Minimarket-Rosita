import definitions from './registry.json';
import { validateTheme, contrastIssues } from './validation.mjs';
export const tokens = definitions;
export type ThemeValues = Record<string, string>;
export interface PublishedTheme { revision: number; updatedAt: string | null; values: ThemeValues }
export const defaults: ThemeValues = Object.fromEntries(tokens.map(token => [token.key, token.default]));
export const validate = (input: unknown) => validateTheme(input, tokens, true);
export const sources: Record<string,string> = Object.fromEntries(tokens.filter(t=>t.source).map(t=>[t.key,t.source!]));
export function resolvedValues(input: ThemeValues): ThemeValues {
  const values = { ...input };
  for (const [key,source] of Object.entries(sources)) if(input[key] === defaults[key] && input[source] !== defaults[source]) values[key] = input[source];
  return values;
}
export const issues = (input: ThemeValues) => contrastIssues(resolvedValues(input));
export function themeProperties(input: ThemeValues) {
  const values = resolvedValues(validate(input));
  return Object.fromEntries(tokens.filter(t => t.key !== 'ds-button-variant').map(t => [`--${t.key}`, values[t.key] + t.unit]));
}
export function applyTheme(values: ThemeValues, element: HTMLElement = document.documentElement) {
  for (const [key,value] of Object.entries(themeProperties(values))) element.style.setProperty(key,value);
  element.style.setProperty('--brand',values.primary);
  element.style.setProperty('--rose',values.accent);
  element.dataset.buttonVariant=values['ds-button-variant'];
}
export function clearTheme(element: HTMLElement) {
  for (const token of tokens) element.style.removeProperty('--'+token.key);
  element.style.removeProperty('--brand'); element.style.removeProperty('--rose');
  delete element.dataset.buttonVariant;
}
export async function fetchPublished(): Promise<PublishedTheme> {
  const response = await fetch('/api/design/theme', {cache:'no-store',signal:AbortSignal.timeout(4000)});
  if (!response.ok) throw new Error('No se pudo consultar la configuración del servidor.');
  const result = await response.json();
  if (!Number.isInteger(result.revision) || result.revision < 0) throw new Error('Revisión inválida.');
  return {...result,values:validate(result.values)};
}
let published: PublishedTheme = {revision:0,updatedAt:null,values:defaults};
export const getPublished = () => published;
export function setPublished(theme: PublishedTheme) {published=theme;applyTheme(theme.values);window.dispatchEvent(new Event('rosita-theme-published'));}
export async function bootstrapTheme() {
  try {setPublished(await fetchPublished());} catch {applyTheme(defaults);}
  // Draft previews are accepted only by a same-origin embedding window, never saved.
  window.addEventListener('message',event=>{
    if(window.parent===window || event.source!==window.parent || event.origin!==window.location.origin || event.data?.type!=='rosita-theme-preview')return;
    try {applyTheme(validate(event.data.values));} catch { /* Discard malformed preview messages. */ }
  });
  if(window.parent!==window){window.parent.postMessage({type:'rosita-theme-ready'},window.location.origin);return;}
  const refresh=async()=>{if(document.visibilityState==='hidden')return;try{const next=await fetchPublished();if(next.revision!==published.revision)setPublished(next);}catch{/* Keep the last validated theme during an outage. */}};
  window.addEventListener('focus',refresh);window.setInterval(refresh,30000);
}
