// A shared allowlist: no CSS strings, URLs, selectors or arbitrary property names.
export function validateTheme(input, registry, complete = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Configuración inválida.');
  const definitions = new Map(registry.map(token => [token.key, token]));
  const result = Object.fromEntries(registry.map(token => [token.key, token.default]));
  if (complete && Object.keys(input).length !== registry.length) throw new Error('Configuración incompleta.');
  for (const [key, value] of Object.entries(input)) {
    const token = definitions.get(key);
    if (!token || typeof value !== 'string' || value.length > 160) throw new Error(`Token no permitido: ${key}`);
    if (token.kind === 'color' && !/^#[\da-f]{6}$/i.test(value)) throw new Error(`Color inválido: ${token.label}`);
    if (token.kind === 'select' && !token.options.includes(value)) throw new Error(`Opción inválida: ${token.label}`);
    if (token.kind === 'range' && (!/^-?\d+(\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) || Number(value) < token.min || Number(value) > token.max)) throw new Error(`Valor fuera de rango: ${token.label}`);
    result[key] = token.kind === 'color' ? value.toLowerCase() : value;
  }
  return result;
}
export function contrast(a, b) {
  const luminance = color => {
    const rgb = color.slice(1).match(/../g).map(hex => parseInt(hex, 16) / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export function contrastIssues(values) {
  return [['foreground','background'],['primary-foreground','primary'],['secondary-foreground','secondary'],['accent-foreground','accent'],['card-foreground','card'],['popover-foreground','popover'],['muted-foreground','background'],['ds-button-ink','ds-button-bg'],['ds-input-ink','ds-input-bg']].filter(([ink, bg]) => contrast(values[ink], values[bg]) < 4.5).map(([ink,bg]) => `${ink} / ${bg}: contraste inferior a 4.5:1`);
}
