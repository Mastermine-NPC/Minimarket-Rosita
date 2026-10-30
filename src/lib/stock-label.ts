export const stockLabel = (stock: number, threshold: number) =>
  stock === 0 ? "Agotado" : stock <= threshold ? "Stock bajo" : "Disponible";
