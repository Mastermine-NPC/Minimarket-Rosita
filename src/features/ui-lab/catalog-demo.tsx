import { useState } from 'react';
import { Search, ShoppingBag, Check, Trash2 } from 'lucide-react';
import { products, money, type Variant } from './data';
import { LabButton, LabDialog } from './components';
export function CatalogDemo({ variant }: { variant: Variant }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [detail, setDetail] = useState<typeof products[number] | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [complete, setComplete] = useState(false);
  const [notice, setNotice] = useState('');
  const filtered = products.filter(p => p.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) && (category === 'Todas' || p.category === category));
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = products.reduce((n, p) => n + p.price * (cart[p.id] || 0), 0);
  function add(id: string) { setCart(current => ({ ...current, [id]: (current[id] || 0) + 1 })); setComplete(false); setNotice(`${products.find(p => p.id === id)?.name} agregado al carrito de prueba.`); }
  return <section className={`catalog-demo variant-${variant}`} aria-label={`Catálogo variante ${variant}`}>
    <header className="catalog-title"><div><h2>{variant === 'B' ? 'Encuentra lo que necesitas' : 'Catálogo de prueba'}</h2><p>Datos ficticios · Compra sin pago ni pedido real.</p></div><LabButton variant="outline" onClick={() => setCheckout(true)}>Carrito ({count})</LabButton></header>
    <div className="catalog-tools"><label><span>Buscar productos</span><div className="input-wrap">{variant === 'B' && <Search size={18} />}<input type="search" placeholder="Nombre del producto" value={query} onChange={e => setQuery(e.target.value)} /></div></label><label><span>Categoría</span><select aria-label="Categoría" value={category} onChange={e => setCategory(e.target.value)}>{['Todas', 'Despensa', 'Cuidado', 'Bebidas'].map(c => <option key={c}>{c}</option>)}</select></label><button onClick={() => { setQuery(''); setCategory('Todas'); }}>Limpiar filtros</button></div>
    {variant === 'B' && <div className="catalog-feedback"><span>{filtered.length} productos encontrados{category !== 'Todas' ? ` · ${category}` : ''}</span><span>{count} en carrito · {money(total)}</span></div>}
    <p className="catalog-notice" role="status">{notice || (complete ? 'Compra simulada completada.' : 'Selecciona un producto para consultar sus características.')}</p>
    <div className="lab-product-grid">{filtered.map(p => <article className="lab-product" key={p.id}>{variant === 'B' && <div className="demo-product-art" aria-hidden="true"><ShoppingBag size={44} strokeWidth={1} /></div>}<p className="product-category">{p.category}</p><h3><button onClick={() => setDetail(p)}>{p.name}</button></h3><p>{p.description.split('. ')[0]}</p><strong>{money(p.price)}</strong><div className="product-actions"><button onClick={() => setDetail(p)}>Ver detalle</button><LabButton onClick={() => add(p.id)} icon={variant === 'B'}>{variant === 'B' && cart[p.id] ? `Agregar otro (${cart[p.id]})` : 'Agregar'}</LabButton></div></article>)}</div>
    {!filtered.length && <p>No se encontraron productos. Prueba otro nombre o limpia los filtros.</p>}
    <LabDialog open={!!detail} onClose={() => setDetail(null)} title={detail?.name || 'Producto'}>{detail && <><p>{detail.description}</p><p>Categoría: {detail.category}</p><p>Precio: {money(detail.price)}</p><LabButton onClick={() => add(detail.id)}>Agregar al carrito</LabButton></>}</LabDialog>
    <LabDialog open={checkout} onClose={() => setCheckout(false)} title="Compra simulada">{count ? <><ul className="cart-list">{products.filter(p => cart[p.id]).map(p => <li key={p.id}><span>{p.name} × {cart[p.id]} · {money(p.price * cart[p.id])}</span><button aria-label={`Quitar ${p.name}`} onClick={() => setCart(current => ({ ...current, [p.id]: 0 }))}><Trash2 size={18} /></button></li>)}</ul><strong>Total: {money(total)}</strong><p>Sin datos personales, pagos, stock ni conexión a la tienda.</p><LabButton onClick={() => { setCart({}); setComplete(true); setNotice('Compra simulada completada. No se generó un pedido real.'); setCheckout(false); }}><Check size={18} />Completar simulación</LabButton></> : <p>El carrito de prueba está vacío.</p>}</LabDialog>
  </section>;
}
export function Comparison() {
  const [view, setView] = useState('both');
  const [revision, setRevision] = useState(0);
  return <><div className="section-heading"><div><h1>Comparador A/B</h1><p>La misma tarea, dos propuestas. Cada carrito y búsqueda son independientes.</p></div><button onClick={() => setRevision(v => v + 1)}>Reiniciar demostraciones</button></div><div className="segmented" aria-label="Vista del comparador">{[['both', 'Ambas'], ['A', 'Variante A'], ['B', 'Variante B']].map(([value, label]) => <button key={value} aria-pressed={view === value} onClick={() => setView(value)}>{label}</button>)}</div><div className={`comparison ${view === 'both' ? 'both' : ''}`}>{(['A', 'B'] as const).filter(v => view === 'both' || view === v).map(v => <div key={`${v}-${revision}`}><h2>Variante {v}</h2><p>{v === 'A' ? 'Listado compacto, filtros directos y confirmación textual.' : 'Jerarquía por producto, resultados visibles, total inmediato y cantidades por acción.'}</p><CatalogDemo variant={v} /></div>)}</div><section className="lab-document"><h2>Protocolo compartido</h2><p>Buscar Arroz Rosita, filtrar Despensa, consultar sus características y completar una compra simulada. A y B comparten nombres, precios, controles y posibilidades. Las mejoras de B son hipótesis que deben contrastarse con participantes.</p></section></>;
}
