import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { applyTheme, type ThemeValues } from './theme';
export function ComponentPreview({values,label}:{values:ThemeValues;label:string}){
 const root=useRef<HTMLDivElement>(null),[open,setOpen]=useState(false),dialog=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{if(root.current)applyTheme(values,root.current);if(dialog.current)applyTheme(values,dialog.current);},[values,open]);
 return <div ref={root} className="design-preview"><h3>{label}</h3><p>Componentes reales · sus acciones solo demuestran estados.</p><div className="design-button-row"><Button>Acción principal</Button><Button variant="outline">Outline</Button><Button variant="secondary">Secundario</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Peligro</Button><Button disabled>Desactivado</Button></div><label className="design-demo-field">Nombre<Input placeholder="Escribe un nombre" /></label><label className="design-demo-field">Campo desactivado<Input disabled value="No editable" readOnly /></label><Card><CardHeader><CardTitle>Una superficie Rosita</CardTitle><CardDescription>Tarjeta convencional, sin sustituir las tarjetas especiales.</CardDescription></CardHeader><CardContent><Badge>Disponible</Badge><p>Tipografía, color y profundidad compartidos.</p></CardContent></Card><Alert><AlertTitle>Información</AlertTitle><AlertDescription>Vista previa sin cambios en pedidos o inventario.</AlertDescription></Alert><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline">Probar modal</Button></DialogTrigger><DialogContent ref={dialog}><DialogHeader><DialogTitle>Modal de demostración</DialogTitle><DialogDescription>Usa los tokens de la propuesta sin publicarlos.</DialogDescription></DialogHeader><Button onClick={()=>setOpen(false)}>Cerrar vista previa</Button></DialogContent></Dialog></div>;
}
