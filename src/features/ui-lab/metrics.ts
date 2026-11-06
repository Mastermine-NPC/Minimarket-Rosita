import type { Variant } from './data';
export const storageKey = 'rosita-ui-lab:evaluations:v1';
export interface Trial { id: string; participant: string; variant: Variant; task: number; seconds: number; errors: number; success: boolean; comments: string; observations: string; date: string }
export function validTrial(value: unknown): value is Trial {
  if (!value || typeof value !== 'object') return false;
  const t = value as Trial;
  return typeof t.id === 'string' && typeof t.participant === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(t.participant) && (t.variant === 'A' || t.variant === 'B') && Number.isInteger(t.task) && t.task >= 0 && t.task < 4 && Number.isFinite(t.seconds) && t.seconds >= 0 && Number.isInteger(t.errors) && t.errors >= 0 && typeof t.success === 'boolean' && typeof t.comments === 'string' && typeof t.observations === 'string' && typeof t.date === 'string';
}
export function loadTrials(): Trial[] {
  try { const data: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(data) ? data.filter(validTrial) : []; } catch { return []; }
}
export function summarize(rows: Trial[]) {
  return { count: rows.length, seconds: rows.length ? rows.reduce((n, t) => n + t.seconds, 0) / rows.length : null, errors: rows.reduce((n, t) => n + t.errors, 0), averageErrors: rows.length ? rows.reduce((n, t) => n + t.errors, 0) / rows.length : null, success: rows.length ? rows.filter(t => t.success).length / rows.length * 100 : null };
}
const cell = (value: unknown) => { let text = String(value ?? ''); if (/^[=+\-@\t\r]/.test(text.trimStart())) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; };
export function csv(rows: unknown[][]) { return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n'); }
export function exportFile(name: string, rows: unknown[][]) {
  const url = URL.createObjectURL(new Blob([csv(rows)], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
