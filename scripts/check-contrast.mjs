import fs from "node:fs";
const css = fs.readFileSync(
  new URL("../src/styles/tokens.css", import.meta.url),
  "utf8",
);
const colors = Object.fromEntries(
  [...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map((m) => [m[1], m[2]]),
);
for (const match of css.matchAll(/--([\w-]+):\s*var\(--([\w-]+)\)/g)) {
  if (colors[match[2]]) colors[match[1]] = colors[match[2]];
}
function luminance(hex) {
  const c = hex
    .slice(1)
    .match(/../g)
    .map((x) => {
      const v = parseInt(x, 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const pairs = [
  ["Inicio blanco/verde", "primary-foreground", "brand", 4.5],
  ["Inicio rosa/verde y foco", "rose", "brand", 4.5],
  ["Inicio verde/rosa", "brand", "rose", 4.5],
  ["Inicio verde suave/verde", "secondary", "brand", 4.5],
  ["Sidebar texto", "inverse-muted", "admin-sidebar", 4.5],
  ["Sidebar foco", "ring-inverse", "admin-sidebar", 3],
  ["Texto/superficie", "foreground", "card", 4.5],
  ["Texto/fondo", "foreground", "background", 4.5],
  ["Botón principal", "primary-foreground", "primary", 4.5],
  ["Botón hover", "primary-foreground", "action-hover", 4.5],
  ["Botón presionado", "primary-foreground", "action-pressed", 4.5],
  ["Secundario", "secondary-foreground", "secondary", 4.5],
  ["Acento", "accent-foreground", "accent", 4.5],
  ["Error", "destructive", "card", 4.5],
  ["Inventario agotado", "destructive", "error-surface", 4.5],
  ["Inventario desactivado", "muted-foreground", "muted", 4.5],
  ["Éxito", "success", "success-surface", 4.5],
  ["Aviso", "warning", "warning-surface", 4.5],
  ["Texto secundario", "muted-foreground", "card", 4.5],
  ["Texto secundario/fondo", "muted-foreground", "background", 4.5],
  ["Foco/superficie", "ring", "card", 3],
  ["Foco/fondo", "ring", "background", 3],
  ["Borde de control", "input", "card", 3],
  ["Texto sobre rosa", "foreground", "rose", 4.5],
  ["Footer secundario", "inverse-muted", "brand", 4.5],
  ["Footer cuerpo", "inverse-copy", "brand", 4.5],
];
const results = pairs.map(([name, fg, bg, minimum]) => {
  const value = ratio(colors[fg], colors[bg]);
  return {
    name,
    foreground: colors[fg],
    background: colors[bg],
    ratio: Number(value.toFixed(2)),
    minimum,
    passed: value >= minimum,
  };
});
const report = {
  results,
  brandWhiteRatio: Number(ratio("#FFFFFF", colors.brand).toFixed(2)),
  brandRule:
    "La marca verde admite texto blanco. Sobre rosa usar texto oscuro; foco, error, éxito y advertencia tienen tokens separados.",
};
if (process.argv.includes("--json"))
  console.log(JSON.stringify(report, null, 2));
else {
  console.table(results);
  console.log(report.brandRule);
}
if (results.some((result) => !result.passed)) process.exitCode = 1;
