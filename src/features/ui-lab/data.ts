import definitions from '@/design/registry.json';
export const sections = [
  ['tokens', 'Design Tokens'], ['button', 'Botones'], ['input', 'Campos de entrada'], ['card', 'Tarjetas'],
  ['navigation', 'Menús de navegación'], ['modal', 'Modales y ventanas'], ['catalog', 'Componentes de catálogo'],
  ['promotion', 'Componentes promocionales'], ['interaction', 'Componentes de interacción'],
  ['animation', 'Animaciones y transiciones'], ['three', 'Componentes 3D'],
  ['comparison', 'Comparador A/B'], ['evaluation', 'Pruebas de usabilidad'], ['documentation', 'Documentación'],
] as const;
export type Section = typeof sections[number][0];
export type Variant = 'A' | 'B';
export const tasks = ['Encontrar Arroz Rosita mediante búsqueda', 'Filtrar la categoría Despensa', 'Consultar las características del arroz', 'Agregar arroz y completar una compra simulada'];
export const products = [
  { id: 'lab-arroz', name: 'Arroz Rosita', category: 'Despensa', price: 450, description: 'Arroz de grano largo · bolsa de 1 kg. Producto ficticio para evaluación.' },
  { id: 'lab-avena', name: 'Avena integral', category: 'Despensa', price: 620, description: 'Hojuelas integrales · bolsa de 500 g. Producto ficticio para evaluación.' },
  { id: 'lab-jabon', name: 'Jabón vegetal', category: 'Cuidado', price: 380, description: 'Jabón de uso diario · barra de 90 g. Producto ficticio para evaluación.' },
  { id: 'lab-jugo', name: 'Jugo de naranja', category: 'Bebidas', price: 590, description: 'Bebida de naranja · envase de 1 L. Producto ficticio para evaluación.' },
];
export const money = (cents: number) => `S/ ${(cents / 100).toFixed(2)}`;
// The editor and the existing lab share the same token registry.
export const tokens = definitions.map(t => [t.key, t.default + t.unit, t.label, t.usage, t.kind === 'color' ? 'color' : t.key.startsWith('font-') ? 'font' : t.key.startsWith('radius') ? 'radius' : t.key.startsWith('shadow') ? 'shadow' : t.key.startsWith('space') ? 'space' : 'type'] as [string,string,string,string,string]);
