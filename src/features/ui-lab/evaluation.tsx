import { useEffect, useRef, useState } from 'react';
import { tasks, type Variant } from './data';
import { loadTrials, summarize, storageKey, validTrial, exportFile, type Trial } from './metrics';
import { LabButton } from './components';
import { CatalogDemo } from './catalog-demo';
export function Evaluation() {
  const [rows, setRows] = useState(loadTrials);
  const [participant, setParticipant] = useState('');
  const [variant, setVariant] = useState<Variant>('A');
  const [task, setTask] = useState(0);
  const [seconds, setSeconds] = useState('0');
  const [errors, setErrors] = useState('0');
  const [success, setSuccess] = useState(true);
  const [comments, setComments] = useState('');
  const [observations, setObservations] = useState('');
  const [running, setRunning] = useState(false);
  const start = useRef(0);
  const accumulated = useRef(0);
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds(((accumulated.current + performance.now() - start.current) / 1000).toFixed(1)), 100);
    return () => clearInterval(timer);
  }, [running]);
  function pause() { if (running) { accumulated.current += performance.now() - start.current; setSeconds((accumulated.current / 1000).toFixed(1)); } setRunning(false); }
  function save(next: Trial[]) { try { localStorage.setItem(storageKey, JSON.stringify(next)); setRows(next); return true; } catch { setNotice('No se pudo guardar. Exporta tus registros y revisa el almacenamiento del navegador.'); return false; } }
  const filtered = rows.filter(row => !filter || row.participant === filter);
  const summaryRows = tasks.flatMap((name, index) => (['A', 'B'] as const).map(v => ({ task: name, variant: v, ...summarize(filtered.filter(r => r.task === index && r.variant === v)) })));
  const participants = [...new Set(rows.map(r => r.participant))];
  return <><div className="section-heading"><div><h1>Pruebas de usabilidad</h1><p>Registro del evaluador. No contiene participantes ni resultados precargados.</p></div><button disabled={!rows.length} onClick={() => exportFile('rosita-ui-lab-registros.csv', [['id', 'participante', 'variante', 'tarea', 'segundos', 'errores', 'exito', 'comentarios', 'observaciones', 'fecha'], ...rows.map(r => [r.id, r.participant, r.variant, tasks[r.task], r.seconds, r.errors, r.success, r.comments, r.observations, r.date])])}>Exportar registros CSV</button></div>
    <div className="evaluation-grid"><form className="lab-panel" onSubmit={event => { event.preventDefault(); pause(); const row: Trial = { id: crypto.randomUUID(), participant: participant.trim(), variant, task, seconds: Number(seconds), errors: Number(errors), success, comments, observations, date: new Date().toISOString() }; if (!validTrial(row)) { setNotice('Revisa identificador, tiempo y errores.'); return; } if (save([...rows, row])) { setNotice('Registro guardado. Reinicia el tiempo para una nueva tarea.'); accumulated.current = 0; setSeconds('0'); setErrors('0'); setComments(''); setObservations(''); } }}>
      <h2>Registrar una tarea</h2><label>Identificador anónimo<input required maxLength={40} pattern="[A-Za-z0-9_-]+" placeholder="Ej. P-01" value={participant} onChange={e => setParticipant(e.target.value)} disabled={running} /></label><small>Usa un código; evita nombres, teléfonos o correos.</small>
      <label>Variante<select aria-label="Variante" value={variant} onChange={e => { setVariant(e.target.value as Variant); setRevision(n => n + 1); }} disabled={running}><option>A</option><option>B</option></select></label>
      <label>Tarea<select aria-label="Tarea" value={task} onChange={e => setTask(Number(e.target.value))} disabled={running}>{tasks.map((t, i) => <option key={t} value={i}>{i + 1}. {t}</option>)}</select></label>
      <label>Tiempo (segundos)<input type="number" min="0" step="0.1" required value={seconds} disabled={running} onChange={e => { setSeconds(e.target.value); accumulated.current = Number(e.target.value) * 1000; }} /></label><div className="inline-controls"><button type="button" onClick={() => { if (running) pause(); else { start.current = performance.now(); setRunning(true); } }}>{running ? 'Pausar' : 'Iniciar cronómetro'}</button><button type="button" onClick={() => { setRunning(false); accumulated.current = 0; setSeconds('0'); }}>Reiniciar tiempo</button></div>
      <label>Errores observados<input type="number" min="0" step="1" required value={errors} onChange={e => setErrors(e.target.value)} /></label><label>Resultado<select aria-label="Resultado" value={success ? 'success' : 'failure'} onChange={e => setSuccess(e.target.value === 'success')}><option value="success">Éxito</option><option value="failure">Fracaso</option></select></label><label>Comentarios<textarea maxLength={2000} value={comments} onChange={e => setComments(e.target.value)} /></label><label>Observaciones<textarea maxLength={2000} value={observations} onChange={e => setObservations(e.target.value)} /></label><LabButton type="submit" disabled={running}>Guardar registro</LabButton><p role="status">{notice}</p>
    </form><div><h2>Escenario de prueba · {variant}</h2><p>{tasks[task]}. Inicia el cronómetro antes de ceder el escenario al participante.</p><button disabled={running} onClick={() => setRevision(n => n + 1)}>Reiniciar escenario</button><CatalogDemo key={`${variant}-${revision}`} variant={variant} /></div></div>
    <section className="lab-document"><div className="section-heading"><h2>Resultados comparativos</h2><label>Participante<select aria-label="Participante" value={filter} onChange={e => setFilter(e.target.value)}><option value="">Todos</option>{participants.map(p => <option key={p}>{p}</option>)}</select></label><button disabled={!filtered.length} onClick={() => exportFile('rosita-ui-lab-resultados.csv', [['participante', 'tarea', 'variante', 'pruebas', 'tiempo_promedio_s', 'errores_totales', 'errores_promedio', 'exito_porcentaje', 'delta_B_menos_A_s'], ...summaryRows.map(r => { const a = summaryRows.find(other => other.task === r.task && other.variant === 'A'); return [filter || 'Todos', r.task, r.variant, r.count, r.seconds, r.errors, r.averageErrors, r.success, r.variant === 'B' && r.seconds !== null && a?.seconds != null ? r.seconds - a.seconds : null]; })])}>Exportar resultados CSV</button></div>
    {!rows.length && <p>Sin registros. Las métricas aparecerán al registrar tareas de participantes reales.</p>}
    <div className="table-scroll"><table><caption>Métricas según los registros {filter ? `de ${filter}` : 'de todos los participantes'}</caption><thead><tr><th>Tarea</th><th>Variante</th><th>Pruebas</th><th>Tiempo medio (s)</th><th>Errores</th><th>Error medio</th><th>Éxito</th><th>Δ B − A (s)</th></tr></thead><tbody>{summaryRows.map(r => { const other = summaryRows.find(s => s.task === r.task && s.variant !== r.variant); return <tr key={r.task + r.variant}><th>{r.task}</th><td>{r.variant}</td><td>{r.count}</td><td>{r.seconds?.toFixed(1) ?? '—'}</td><td>{r.errors}</td><td>{r.averageErrors?.toFixed(2) ?? '—'}</td><td>{r.success === null ? '—' : `${r.success.toFixed(1)}%`}</td><td>{r.variant === 'B' && r.seconds !== null && other?.seconds != null ? (r.seconds - other.seconds).toFixed(1) : '—'}</td></tr>; })}</tbody></table></div>
    <p>Tiempo y errores medios = suma / registros válidos. Éxito = tareas completadas / tareas registradas × 100. Una diferencia negativa indica menor tiempo en B. Cada fila es un intento; los reintentos cuentan por separado. No se infiere causalidad ni significancia estadística.</p>
    {tasks.some((_, taskIndex) => ['A', 'B'].every(v => filtered.some(r => r.task === taskIndex && r.variant === v))) && <figure className="metric-chart"><figcaption>Tiempo medio por tarea (segundos). A gris; B verde.</figcaption>{summaryRows.filter(r => r.seconds !== null).map(r => <div key={r.task + r.variant}><span>{tasks.indexOf(r.task) + 1} · {r.variant}</span><meter data-variant={r.variant} aria-label={`${r.task}, variante ${r.variant}`} min={0} max={Math.max(1, ...summaryRows.map(s => s.seconds || 0))} value={r.seconds || 0} /><span>{r.seconds?.toFixed(1)} s</span></div>)}</figure>}
    <h3>Registros y notas cualitativas</h3><div className="trial-list">{filtered.map(r => <article key={r.id}><strong>{r.participant} · {r.variant} · Tarea {r.task + 1}</strong><p>{r.seconds}s · {r.errors} errores · {r.success ? 'Éxito' : 'Fracaso'}</p><p>Comentarios: {r.comments || '—'}</p><p>Observaciones: {r.observations || '—'}</p><button onClick={() => { if (window.confirm('¿Eliminar este registro del laboratorio?')) save(rows.filter(t => t.id !== r.id)); }}>Eliminar registro</button></article>)}</div>
    <p>Solo se almacena en este navegador bajo una clave propia. Exporta antes de borrar datos. No hay sincronización, cuentas ni conexión a la tienda. Los comentarios no deben incluir datos personales.</p></section></>;
}
