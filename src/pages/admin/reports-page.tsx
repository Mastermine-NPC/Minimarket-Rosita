import { useMemo, useState, useRef } from "react";
import { useRosita } from "@/hooks/use-rosita";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { buildReport, reportCSV, defaultReportFilters } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminHeading } from "@/features/administracion/admin-common";
import { toast } from "sonner";
export function ReportsPage() {
  const { state } = useRosita(),
    { categories } = useTaxonomy(),
    [filters, Filters] = useState(defaultReportFilters),
    [busy, Busy] = useState(false),
    report = useMemo(
      () => buildReport(state, filters, new Date().toISOString()),
      [state, filters],
    );
  const update = (key: keyof typeof filters, value: string) =>
    Filters((old) => ({ ...old, [key]: value }));
  const dates = !["inventory", "low"].includes(filters.type);
  const exportLock = useRef(false);
  async function download() {
    if (exportLock.current) return;
    exportLock.current = true;
    Busy(true);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    try {
      const blob = new Blob([reportCSV(report)], {
          type: "text/csv;charset=utf-8",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download =
        "rosita-" +
        filters.type +
        "-" +
        report.generatedAt.slice(0, 10) +
        ".csv";
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("CSV preparado", {
        description:
          "Archivo de demostración con filtros, generación y resumen.",
      });
    } catch {
      toast.error("No se pudo generar el archivo CSV.");
    } finally {
      Busy(false);
      exportLock.current = false;
    }
  }
  return (
    <div className="admin-page reports-page">
      <AdminHeading
        eyebrow="DATOS QUE PUEDES REVISAR"
        title="Reportes"
        description="Vista previa y exportación de los mismos registros de tienda e inventario. No representan ingresos reales."
      />
      <section className="report-controls">
        <div className="field">
          <Label htmlFor="report-type">Reporte</Label>
          <select
            id="report-type"
            value={filters.type}
            onChange={(e) => update("type", e.target.value)}
          >
            {[
              ["inventory", "Inventario actual"],
              ["low", "Agotados y stock bajo"],
              ["orders", "Pedidos por fecha y estado"],
              ["digital", "Ventas digitales · confirmaciones"],
              ["cash", "Ventas presenciales · no implementadas"],
              ["top", "Productos más vendidos"],
            ].map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {dates ? (
          <>
            <div className="field">
              <Label htmlFor="report-from">Desde · fecha Perú</Label>
              <Input
                id="report-from"
                type="date"
                value={filters.from}
                onChange={(e) => update("from", e.target.value)}
                aria-invalid={!!report.error}
              />
            </div>
            <div className="field">
              <Label htmlFor="report-to">Hasta · fecha Perú</Label>
              <Input
                id="report-to"
                type="date"
                value={filters.to}
                onChange={(e) => update("to", e.target.value)}
                aria-invalid={!!report.error}
              />
            </div>
            <div className="field">
              <Label htmlFor="report-status">Estado del pedido</Label>
              <select
                id="report-status"
                value={filters.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="">Todos</option>
                {["Recibido", "En preparación", "En camino", "Entregado"].map(
                  (s, i) => (
                    <option key={s} value={i}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </div>
          </>
        ) : (
          <div className="field">
            <Label htmlFor="report-category">Categoría</Label>
            <select
              id="report-category"
              value={filters.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>
      {report.error && (
        <p role="alert" className="field-error">
          ⚠ {report.error}
        </p>
      )}
      <div className="customer-actions report-actions">
        <Button
          aria-busy={busy}
          disabled={!!report.error || busy}
          title={report.error || undefined}
          onClick={download}
        >
          {busy ? "Preparando…" : "Exportar CSV"}
        </Button>
        <Button
          variant="outline"
          disabled={!!report.error}
          title={report.error || undefined}
          onClick={() => window.print()}
        >
          Imprimir / Guardar como PDF
        </Button>
        <Button variant="ghost" onClick={() => Filters(defaultReportFilters)}>
          Limpiar filtros
        </Button>
      </div>
      <section className="report-print" aria-label="Vista previa del reporte">
        <span className="eyebrow">
          MINIMARKET ROSITA · DATOS DE DEMOSTRACIÓN
        </span>
        <h2>{report.title}</h2>
        <p>
          Generado:{" "}
          <time dateTime={report.generatedAt}>
            {new Date(report.generatedAt).toLocaleString("es-PE", {
              timeZone: "America/Lima",
            })}{" "}
            · Perú
          </time>
        </p>
        <p>Filtros aplicados: {report.filters}</p>
        <p className="report-total" role="status">
          {report.total}
        </p>
        <div className="report-table-scroll">
          <table>
            <caption>Vista previa · {report.rows.length} registros</caption>
            <thead>
              <tr>
                {report.headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!report.rows.length && (
          <p>No hay registros para este reporte y sus filtros.</p>
        )}
        <p className="hint">
          Prototipo local. Pedidos confirmados no equivalen a pagos cobrados.
          Caja no implementada; no se mezclan canales ni se añaden ventas
          históricas.
        </p>
      </section>
    </div>
  );
}
