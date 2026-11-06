import { useEffect, useRef, useId, type ReactNode, type CSSProperties, type ButtonHTMLAttributes } from 'react';
import { ShoppingBag, LoaderCircle, Check } from 'lucide-react';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: string; size?: string; radius?: string; state?: string; icon?: boolean }
export function LabButton({ children, variant = 'solid', size = 'medium', radius, state = 'default', icon, ...props }: ButtonProps) {
  return <button {...props} className={`demo-button ${props.className || ''}`} data-look={variant} data-size={size} data-state={state} style={{ '--demo-radius': radius ? `${radius}px` : 'var(--radius-control)' } as CSSProperties} disabled={props.disabled || state === 'disabled' || state === 'loading'} aria-busy={state === 'loading' || undefined}>{state === 'loading' ? <LoaderCircle className="spinner" size={18} /> : icon ? <ShoppingBag size={18} /> : state === 'success' ? <Check size={18} /> : null}{children}</button>;
}
export function LabInput({ label = 'Nombre', placeholder = 'Escribe aquí', type = 'text', state = 'default', error = 'Revisa este campo.', icon = false }: { label?: string; placeholder?: string; type?: string; state?: string; error?: string; icon?: boolean }) {
  const helpId = useId();
  return <label className="demo-field" data-state={state}><span>{label}</span><span className="input-wrap">{icon && <ShoppingBag size={18} />}<input type={type} placeholder={placeholder} disabled={state === 'disabled' || state === 'loading'} aria-invalid={state === 'error'} aria-describedby={helpId} /></span><small id={helpId}>{state === 'error' ? error : state === 'success' ? 'Información válida.' : state === 'loading' ? 'Validando…' : 'Este dato solo existe en la demostración.'}</small></label>;
}
export function LabCard({ title, description, price, badge, image = true, shadow = false, hover = true, onAdd }: { title: string; description: string; price: number; badge: string; image?: boolean; shadow?: boolean; hover?: boolean; onAdd?: () => void }) {
  return <article className={`demo-card ${shadow ? 'has-shadow' : ''} ${hover ? 'has-hover' : ''}`}>{image && <div className="demo-product-art" aria-hidden="true"><ShoppingBag size={52} strokeWidth={1} /></div>}{badge && <span className="badge">{badge}</span>}<h3>{title}</h3><p>{description}</p><strong>S/ {(price / 100).toFixed(2)}</strong><LabButton onClick={onAdd}>Agregar</LabButton></article>;
}
export function LabDialog({ open, onClose, title, children, size = 'medium', animation = 'fade', backdrop = true, outsideClose = true }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: string; animation?: string; backdrop?: boolean; outsideClose?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; if (open && !dialog?.open) dialog?.showModal(); if (!open && dialog?.open) dialog.close(); }, [open]);
  return <dialog ref={ref} className="lab-dialog" data-size={size} data-animation={animation} data-backdrop={backdrop} aria-label={title} onCancel={onClose} onClose={onClose} onClick={event => { if (outsideClose && event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}><div className="dialog-heading"><h2>{title}</h2><button aria-label="Cerrar ventana" onClick={onClose}>×</button></div>{children}</dialog>;
}
