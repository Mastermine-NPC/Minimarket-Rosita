import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// Load server-only settings without exposing them as VITE_* variables.
try { process.loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const args = process.argv.slice(2);
function option(name, fallback) {
  const equal = args.find(value => value.startsWith(name + '='));
  if (equal) return equal.slice(name.length + 1);
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : name === '--host' ? '0.0.0.0' : fallback;
}
const port = Number(option('--port', '5173'));
const backendPort = Number(process.env.ROSITA_DESIGN_PORT || '4191');
if (!Number.isInteger(port) || port < 1 || port > 65535 || !Number.isInteger(backendPort) || backendPort < 1 || backendPort > 65535 || port === backendPort) throw new Error('Los puertos de frontend y backend deben ser válidos y diferentes.');
const vite = await createServer({ server: { port, strictPort: args.some(value => value === '--port' || value.startsWith('--port=')), host: option('--host', 'localhost'), open: args.includes('--open'), proxy: { '/api/design': `http://127.0.0.1:${backendPort}` } } });
// Let Vite choose its next free port before deriving the API's exact allowed origin.
try { await vite.listen(); } catch (error) { await vite.close(); throw error; }
const address = vite.httpServer.address();
const actualPort = typeof address === 'object' && address ? address.port : port;
const origin = process.env.ROSITA_DEV_ORIGIN || `http://localhost:${actualPort}`;
const backend = spawn(process.execPath, [fileURLToPath(new URL('../server/design-server.mjs', import.meta.url))], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  env: { ...process.env, PORT: String(backendPort), ROSITA_APP_ORIGIN: origin },
  stdio: 'inherit',
});
let closing = false;
async function close(code = 0) {
  if (closing) return;
  closing = true;
  await vite.close();
  if (backend.exitCode === null && !backend.signalCode) backend.kill();
  process.exitCode = code;
}
backend.once('error', error => { console.error(error.message); void close(1); });
backend.once('exit', code => { if (!closing) { console.error('El servicio visual se detuvo; se cierra el frontend.'); void close(code || 1); } });
process.once('SIGINT', () => { void close(); });
process.once('SIGTERM', () => { void close(); });
try {
  let ready = false;
  for (let attempt = 0; attempt < 50 && !closing; attempt++) {
    try { const response = await fetch(`http://127.0.0.1:${backendPort}/api/design/session`, { signal: AbortSignal.timeout(500) }); if (response.ok) { ready = true; break; } } catch { /* Wait for the child to bind its socket. */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready || closing) throw new Error('No se pudo iniciar el servicio visual. Comprueba el puerto y la configuración del servidor.');
  vite.printUrls();
  console.log(`API visual conectada en ${backendPort}. Un solo Ctrl+C detiene ambos servicios.`);
} catch (error) { console.error(error.message); await close(1); }
