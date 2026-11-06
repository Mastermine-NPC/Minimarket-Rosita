import { useState, type CSSProperties } from 'react';
import { ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { LabButton, LabCard, LabInput, LabDialog } from './components';
import { sections, type Section } from './data';
const documentation = {
  button: { description: 'Acción explícita con respuesta visual y nombre accesible.', goal: 'Confirmar una acción sin ambigüedad.', variants: 'solid, outline, soft', props: 'children, variant, size, radius, state, icon, disabled, onClick', states: 'default, hover, active, focus, disabled, loading, error, success', behavior: 'Enter o Espacio activan; loading bloquea envíos repetidos.', rules: 'Una acción principal por grupo. Conserva la etiqueta al cargar.', code: '<LabButton variant="solid" size="medium" icon onClick={add}>Agregar</LabButton>' },
  input: { description: 'Entrada etiquetada con ayuda y validación semántica.', goal: 'Recoger un dato y explicar su estado.', variants: 'text, email, password, number', props: 'label, placeholder, type, state, error, icon', states: 'default, hover, active, focus, disabled, loading, error, success', behavior: 'Edición nativa. Error usa aria-invalid y ayuda asociada.', rules: 'Etiqueta visible; no comunicar errores solo mediante color.', code: '<LabInput label="Correo" type="email" state="error" error="Revisa el correo." />' },
  card: { description: 'Objeto de producto con título, información y acción.', goal: 'Comparar productos sin perder contexto.', variants: 'con imagen / sin imagen; con sombra / plana', props: 'title, description, price (céntimos), badge, image, shadow, hover, onAdd', states: 'default, hover, focus en acción', behavior: 'El botón ejecuta una acción local. La tarjeta no suplanta un enlace.', rules: 'Precio en céntimos; imágenes ilustrativas, sin promesas comerciales.', code: '<LabCard title="Arroz Rosita" description="Bolsa de 1 kg" price={450} badge="Prueba" onAdd={add} />' },
  navigation: { description: 'Navegación de demostración con selección y desplegable.', goal: 'Encontrar destinos y reconocer la sección activa.', variants: 'horizontal, vertical', props: 'items, active, layout, dropdown', states: 'default, hover, active, focus', behavior: 'Botones nativos y details/summary para el menú. Sin rutas de tienda.', rules: 'No usar selección solo por color. El foco permanece visible.', code: '<LabNavigation items={["Inicio", "Catálogo"]} layout="horizontal" />' },
  modal: { description: 'Ventana modal nativa para una decisión contextual.', goal: 'Resolver una tarea breve y regresar al disparador.', variants: 'small, medium, large; fade, lift, none', props: 'open, onClose, title, size, animation, backdrop, outsideClose, children', states: 'cerrado, abierto, focus', behavior: 'dialog.showModal gestiona foco y confinamiento; Escape cierra y devuelve foco.', rules: 'Siempre ofrecer cierre visible. No pedir datos reales en el laboratorio.', code: '<LabDialog open={open} onClose={() => setOpen(false)} title="Confirmar">Contenido</LabDialog>' },
} as const;
export function LabNavigation({ items, layout, dropdown }: { items: string[]; layout: string; dropdown: boolean }) {
  const [active, setActive] = useState(items[0]);
  return <nav className={`demo-navigation ${layout}`} aria-label="Menú de demostración">{items.map(item => <button key={item} aria-current={active === item ? 'page' : undefined} onClick={() => setActive(item)}>{item}</button>)}{dropdown && <details><summary>Más opciones</summary><div><button onClick={() => setActive('Ayuda')}>Ayuda</button><button onClick={() => setActive('Contacto')}>Contacto</button></div></details>}<p role="status">Sección seleccionada: {active}</p></nav>;
}
export function Explorer({ section }: { section: Section }) {
  const [variant, setVariant] = useState('solid');
  const [size, setSize] = useState('medium');
  const [state, setState] = useState('default');
  const [text, setText] = useState('Agregar al carrito');
  const [radius, setRadius] = useState('10');
  const [icon, setIcon] = useState(true);
  const [label, setLabel] = useState('Correo de prueba');
  const [placeholder, setPlaceholder] = useState('ejemplo@prueba.invalid');
  const [type, setType] = useState('email');
  const [error, setError] = useState('Introduce un correo válido.');
  const [title, setTitle] = useState('Arroz Rosita');
  const [description, setDescription] = useState('Grano largo · bolsa de 1 kg');
  const [price, setPrice] = useState('4.50');
  const [badge, setBadge] = useState('Demostración');
  const [image, setImage] = useState(true);
  const [shadow, setShadow] = useState(false);
  const [hover, setHover] = useState(true);
  const [layout, setLayout] = useState('horizontal');
  const [items, setItems] = useState('Inicio,Catálogo,Nosotros');
  const [dropdown, setDropdown] = useState(true);
  const [open, setOpen] = useState(false);
  const [animation, setAnimation] = useState('fade');
  const [backdrop, setBackdrop] = useState(true);
  const [outside, setOutside] = useState(true);
  const [viewport, setViewport] = useState('desktop');
  const [notice, setNotice] = useState('');
  const key = section in documentation ? section as keyof typeof documentation : 'button';
  const doc = documentation[key];
  function select(name: string, value: string, update: (value: string) => void, options: string[]) { return <label>{name}<select aria-label={name} value={value} onChange={e => update(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select></label>; }
  function input(name: string, value: string, update: (value: string) => void) { return <label>{name}<input aria-label={name} value={value} maxLength={160} onChange={e => update(e.target.value)} /></label>; }
  function toggle(name: string, value: boolean, update: (value: boolean) => void) { return <label className="toggle"><input aria-label={name} type="checkbox" checked={value} onChange={e => update(e.target.checked)} />{name}</label>; }
  return <><div className="section-heading"><div><h1>{sections.find(s => s[0] === section)?.[1]}</h1><p>{doc.description}</p></div>{select('Vista previa', viewport, setViewport, ['desktop', 'tablet', 'mobile'])}</div><div className="explorer-grid"><section className="preview-panel"><div className="preview-top"><h2>Vista previa</h2><span>Estado local</span></div><div className="preview-scroll"><div className={`preview-frame viewport-${viewport}`}>
    {key === 'button' && <LabButton variant={variant} size={size} state={state} radius={radius} icon={icon} onClick={() => setNotice('Acción de demostración ejecutada.')}>{text}</LabButton>}
    {key === 'input' && <LabInput label={label} placeholder={placeholder} type={type} state={state} error={error} icon={icon} />}
    {key === 'card' && <LabCard title={title} description={description} price={Math.max(0, Math.round((Number(price) || 0) * 100))} badge={badge} image={image} shadow={shadow} hover={hover} onAdd={() => setNotice('Producto agregado únicamente en esta demostración.')} />}
    {key === 'navigation' && <LabNavigation items={[...new Set(items.split(',').map(v => v.trim()).filter(Boolean))]} layout={layout} dropdown={dropdown} />}
    {key === 'modal' && <><LabButton onClick={() => setOpen(true)}>Abrir modal</LabButton><LabDialog open={open} onClose={() => setOpen(false)} title={title} size={size} animation={animation} backdrop={backdrop} outsideClose={outside}><p>{description}</p><LabButton onClick={() => { setOpen(false); setNotice('Confirmación local completada.'); }}>Confirmar</LabButton></LabDialog></>}
    </div></div><p className="preview-status" role="status">{notice || 'Prueba los controles o navega con el teclado.'}</p></section><aside className="properties"><h2>Propiedades</h2>
    {key === 'button' && <>{input('Texto', text, setText)}{select('Variante', variant, setVariant, ['solid', 'outline', 'soft'])}{select('Tamaño', size, setSize, ['small', 'medium', 'large'])}{select('Radio', radius, setRadius, ['0', '10', '24'])}{toggle('Icono', icon, setIcon)}</>}
    {(key === 'button' || key === 'input') && select('Estado', state, setState, ['default', 'hover', 'active', 'focus', 'disabled', 'loading', 'error', 'success'])}
    {key === 'input' && <>{input('Etiqueta', label, setLabel)}{input('Placeholder', placeholder, setPlaceholder)}{select('Tipo', type, setType, ['text', 'email', 'password', 'number'])}{input('Mensaje de error', error, setError)}{toggle('Icono', icon, setIcon)}</>}
    {(key === 'card' || key === 'modal') && <>{input('Título', title, setTitle)}{input('Descripción / contenido', description, setDescription)}</>}
    {key === 'card' && <>{input('Precio (S/)', price, setPrice)}{input('Etiqueta', badge, setBadge)}{toggle('Ilustración', image, setImage)}{toggle('Sombra', shadow, setShadow)}{toggle('Efecto hover', hover, setHover)}</>}
    {key === 'navigation' && <>{select('Distribución', layout, setLayout, ['horizontal', 'vertical'])}{input('Elementos separados por coma', items, setItems)}{toggle('Desplegable', dropdown, setDropdown)}</>}
    {key === 'modal' && <>{select('Tamaño', size, setSize, ['small', 'medium', 'large'])}{select('Animación', animation, setAnimation, ['fade', 'lift', 'none'])}{toggle('Fondo de modal', backdrop, setBackdrop)}{toggle('Cerrar al tocar fuera', outside, setOutside)}</>}
    </aside></div><section className="lab-document"><h2>Ficha técnica</h2><dl>{[['Nombre', sections.find(s => s[0] === section)?.[1]], ['Descripción', doc.description], ['Objetivo', doc.goal], ['Variantes', doc.variants], ['Propiedades', doc.props], ['Estados', doc.states], ['Comportamiento', doc.behavior], ['Reglas de uso', doc.rules]].map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl><h3>Ejemplo de implementación</h3><pre><code>{doc.code}</code></pre><p>Los estados del selector son visualizaciones forzadas de los estados nativos. El foco real sigue disponible mediante Tab. Este API pertenece al laboratorio.</p></section></>;
}
export function Supplemental({ section }: { section: Section }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const [duration, setDuration] = useState('240');
  return <><h1>{sections.find(s => s[0] === section)?.[1]}</h1>{section === 'promotion' ? <><section className="promo-demo"><h2>Tu despensa, a tu ritmo.</h2><p>Promoción ficticia para explorar la jerarquía de Rosita.</p><LabButton onClick={() => setCount(n => n + 1)}>Explorar selección <ArrowRight size={18} /></LabButton></section><p role="status">{count ? `Acción promocional activada ${count} veces.` : 'El botón no navega a la tienda.'}</p></> : section === 'interaction' ? <><h2>Confirmación y contador</h2><p>Retroalimentación inmediata sin llamadas de red.</p><LabButton icon onClick={() => setCount(n => n + 1)}>Agregar ({count})</LabButton><p role="status">{count > 0 ? <><Check size={18} /> {count} productos en la demostración.</> : 'Sin productos agregados.'}</p><button onClick={() => setCount(0)}>Reiniciar</button></> : <><h2>Transición de superficie</h2><label>Duración<select value={duration} onChange={e => setDuration(e.target.value)}><option value="150">150 ms</option><option value="240">240 ms</option><option value="300">300 ms</option></select></label><button onClick={() => setVisible(v => !v)}>Alternar transición</button><div className="motion-stage"><div className="motion-sample" data-visible={visible} style={{ '--duration': `${duration}ms` } as CSSProperties}><ShoppingBag size={40} /><p>Superficie de demostración</p></div></div><p>Solo transform y opacity. Con movimiento reducido se elimina el desplazamiento y la duración.</p></>}<section className="lab-document"><h2>Uso y comportamiento</h2><p>Demostración autónoma con datos ficticios. Botones nativos accesibles, foco visible y estados locales. No modifica catálogo, promociones ni navegación comercial.</p><pre><code>{section === 'animation' ? 'transition: transform 240ms, opacity 240ms;\n@media (prefers-reduced-motion: reduce) { transition: none; }' : '<LabButton onClick={() => setCount(n => n + 1)}>Explorar</LabButton>'}</code></pre></section></>;
}
