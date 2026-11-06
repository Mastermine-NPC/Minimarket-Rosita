import { validate, type PublishedTheme, type ThemeValues } from './theme';
export interface DesignSession { configured: boolean; authenticated: boolean; csrf: string | null }
export async function designRequest<T>(path: string, method='GET', data?: unknown, csrf?: string | null): Promise<T> {
  const response=await fetch('/api/design/'+path,{method,credentials:'same-origin',cache:'no-store',headers:{...(data?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(10000)});
  const result=await response.json().catch(()=>({error:'Servicio visual no disponible. Inicia el servidor de Rosita para publicar.'}));
  if(!response.ok)throw new Error(result.error||'No se pudo completar la solicitud.');
  return result;
}
export async function publishTheme(values: ThemeValues,revision:number,csrf:string){const result=await designRequest<PublishedTheme>('theme','PUT',{values:validate(values),revision},csrf);return {...result,values:validate(result.values)};}
