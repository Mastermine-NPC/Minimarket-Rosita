import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { summarize, csv, validTrial, storageKey } = await server.ssrLoadModule('/src/features/ui-lab/metrics.ts');
  const row = { id: 'technical-test', participant: 'TEST_ONLY', variant: 'A', task: 0, seconds: 10, errors: 2, success: true, comments: '', observations: '', date: '2026-11-04' };
  assert(validTrial(row)); assert(!validTrial({ ...row, seconds: -1 })); assert(!validTrial({ ...row, errors: 1.5 })); assert(!validTrial({ ...row, variant: 'C' })); assert(!validTrial({ ...row, participant: 'someone@email.test' }));
  assert.deepEqual(summarize([]), { count: 0, seconds: null, errors: 0, averageErrors: null, success: null });
  assert.deepEqual(summarize([row, { ...row, seconds: 30, errors: 0, success: false }]), { count: 2, seconds: 20, errors: 2, averageErrors: 1, success: 50 });
  assert(csv([['a,b', 'a"b', '=2+2', '+formula', 'line\nbreak']]).includes('"a,b","a""b","\'=2+2","\'+formula","line\nbreak"'));
  assert.equal(storageKey, 'rosita-ui-lab:evaluations:v1');
  console.log('PASS UI Lab: validación, medias, éxito, errores, CSV seguro y clave aislada. Datos técnicos sin participantes reales.');
} finally { await server.close(); }
