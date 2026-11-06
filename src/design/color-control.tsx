import { useEffect, useRef } from 'react';
export function ColorControl({id,label,value,onChange}:{id:string;label:string;value:string;onChange:(value:string)=>void}){
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(input.current)input.current.value=value;},[value]);
 return <div className="design-color-control"><input type="color" aria-label={'Selector de '+label} value={value} onChange={event=>onChange(event.target.value)}/><input ref={input} id={id} aria-label={label} defaultValue={value} maxLength={7} spellCheck={false} onChange={event=>{if(/^#[\da-f]{6}$/i.test(event.target.value))onChange(event.target.value);}} onBlur={event=>{if(!/^#[\da-f]{6}$/i.test(event.target.value))event.currentTarget.value=value;}}/><span style={{background:value}}/></div>;
}
