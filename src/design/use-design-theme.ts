import { useSyncExternalStore } from 'react';
import { getPublished } from './theme';
const subscribe=(listener:()=>void)=>{window.addEventListener('rosita-theme-published',listener);return()=>window.removeEventListener('rosita-theme-published',listener);};
export function useDesignTheme(){return useSyncExternalStore(subscribe,getPublished,getPublished);}
