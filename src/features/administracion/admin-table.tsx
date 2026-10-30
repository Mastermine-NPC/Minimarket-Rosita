import type { ReactNode } from "react";
export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}
export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  label,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  label: string;
}) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table" aria-label={label}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.label}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Pagination({
  page,
  pages,
  onChange,
  total,
}: {
  page: number;
  pages: number;
  onChange: (n: number) => void;
  total: number;
}) {
  return (
    <nav className="admin-pagination" aria-label="Paginación">
      <span>
        {total} {total === 1 ? "resultado" : "resultados"} · Página{" "}
        {Math.min(page, pages)} de {pages}
      </span>
      <div>
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Anterior
        </button>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Siguiente
        </button>
      </div>
    </nav>
  );
}
