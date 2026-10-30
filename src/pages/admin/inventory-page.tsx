import { useTaxonomy } from "@/hooks/use-taxonomy";
import { stockLabel } from "@/lib/stock-label";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useRosita } from "@/hooks/use-rosita";
import { useCatalog } from "@/hooks/use-catalog";

import { normalizeText } from "@/features/catalogo/catalog-logic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AdminHeading,
  AdminEmpty,
} from "@/features/administracion/admin-common";
import { AdminTable, Pagination } from "@/features/administracion/admin-table";
import { StockAdjustment } from "@/features/administracion/stock-adjustment";
import { orderDate } from "@/lib/order-date";
const kindLabels = {
  entry: "Entrada",
  "manual-out": "Salida manual",
  count: "Corrección de conteo",
  "order-out": "Salida por pedido",
};
export function AdminInventoryPage() {
  const { categories } = useTaxonomy();
  const { state } = useRosita(),
    products = useCatalog(),
    [params] = useSearchParams(),
    [q, Q] = useState(params.get("q") || ""),
    [category, Category] = useState(""),
    [status, Status] = useState(params.get("estado") || ""),
    [page, Page] = useState(1),
    [limit, Limit] = useState(10),
    list = products.filter(
      (p) =>
        normalizeText(p.name + " " + p.id + " " + p.brand).includes(
          normalizeText(q),
        ) &&
        (!category || p.category === category) &&
        (!status ||
          (status === "agotado"
            ? p.stock === 0
            : status === "bajo"
              ? p.stock > 0 && p.stock <= (p.lowStockThreshold || 0)
              : p.stock <= (p.lowStockThreshold || 0))),
    ),
    pages = Math.max(1, Math.ceil(list.length / 10)),
    current = Math.min(page, pages),
    ids = new Set(list.map((p) => p.id)),
    moves = state.movements.filter((m) => ids.has(m.productId));
  function clear() {
    Q("");
    Category("");
    Status("");
    Page(1);
  }
  return (
    <div className="admin-page">
      <AdminHeading
        eyebrow="EXISTENCIAS COMPARTIDAS"
        title="Lo que hay, bien contado."
        description="Entradas, salidas y conteos con motivo. Los pedidos confirmados registran su propia salida una sola vez."
      />
      <div className="admin-filters">
        <div>
          <label htmlFor="inventory-search">Buscar producto</label>
          <Input
            id="inventory-search"
            value={q}
            placeholder="Nombre, marca o identificador"
            onChange={(e) => {
              Q(e.target.value);
              Page(1);
            }}
          />
        </div>
        <div>
          <label htmlFor="inventory-category">Categoría</label>
          <select
            id="inventory-category"
            value={category}
            onChange={(e) => {
              Category(e.target.value);
              Page(1);
            }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="inventory-status">Existencias</label>
          <select
            id="inventory-status"
            value={status}
            onChange={(e) => {
              Status(e.target.value);
              Page(1);
            }}
          >
            <option value="">Todas</option>
            <option value="agotado">Agotados</option>
            <option value="bajo">Stock bajo</option>
            <option value="alertas">Todas las alertas</option>
          </select>
        </div>
        <Button variant="outline" onClick={clear}>
          Limpiar filtros
        </Button>
      </div>
      <section className="admin-panel admin-table-panel">
        {list.length ? (
          <>
            <AdminTable
              label="Existencias de Rosita"
              rows={list.slice((current - 1) * 10, current * 10)}
              rowKey={(p) => p.id}
              columns={[
                {
                  key: "product",
                  label: "Producto",
                  render: (p) => (
                    <div>
                      <strong>{p.name}</strong>
                      <small>
                        {p.id} · {p.active ? "Activo" : "Desactivado"}
                      </small>
                    </div>
                  ),
                },
                {
                  key: "stock",
                  label: "Existencias",
                  render: (p) => (
                    <strong className="admin-stock-number">{p.stock}</strong>
                  ),
                },
                {
                  key: "threshold",
                  label: "Umbral",
                  render: (p) => <span>{p.lowStockThreshold} unidades</span>,
                },
                {
                  key: "status",
                  label: "Situación",
                  render: (p) => (
                    <span
                      className={
                        "status-chip " + (p.stock === 0 ? "status-warning" : "")
                      }
                    >
                      {stockLabel(p.stock, p.lowStockThreshold || 0)}
                    </span>
                  ),
                },
                {
                  key: "action",
                  label: "Acción",
                  render: (p) => (
                    <StockAdjustment
                      product={p}
                      trigger={
                        <Button
                          variant="outline"
                          aria-label={"Ajustar " + p.id}
                        >
                          Ajustar stock
                        </Button>
                      }
                    />
                  ),
                },
              ]}
            />
            <Pagination
              page={current}
              pages={pages}
              total={list.length}
              onChange={Page}
            />
          </>
        ) : (
          <AdminEmpty
            title="Sin productos para estos filtros."
            description="Prueba otra categoría o limpia la búsqueda."
          >
            <Button variant="outline" onClick={clear}>
              Limpiar filtros
            </Button>
          </AdminEmpty>
        )}
      </section>
      <section className="admin-panel admin-movements">
        <div className="admin-section-title">
          <h2>Historial de movimientos</h2>
          <span>{moves.length} movimientos</span>
        </div>
        <p className="hint">
          Desde {orderDate(state.recordingSince)}. No se inventan movimientos
          anteriores. Se muestran los productos que coinciden con los filtros.
        </p>
        {moves.length ? (
          <>
            <AdminTable
              label="Movimientos de inventario"
              rows={moves.slice(0, limit)}
              rowKey={(m) => m.id}
              columns={[
                {
                  key: "date",
                  label: "Fecha / origen",
                  render: (m) => (
                    <div>
                      <strong>{orderDate(m.at)}</strong>
                      <small>{m.actorLabel}</small>
                      <small>{m.id}</small>
                    </div>
                  ),
                },
                {
                  key: "product",
                  label: "Producto",
                  render: (m) => (
                    <div>
                      {m.productName}
                      <small>{m.productId}</small>
                    </div>
                  ),
                },
                {
                  key: "kind",
                  label: "Tipo / motivo",
                  render: (m) => (
                    <div>
                      <strong>{kindLabels[m.kind]}</strong>
                      <small>{m.reason}</small>
                      {m.orderId && (
                        <Link to={"/admin/pedidos/" + m.orderId}>
                          Ver pedido
                        </Link>
                      )}
                    </div>
                  ),
                },
                {
                  key: "delta",
                  label: "Diferencia",
                  render: (m) => (
                    <strong>
                      {m.delta > 0 ? "+" : ""}
                      {m.delta}
                    </strong>
                  ),
                },
                {
                  key: "before",
                  label: "Antes → después",
                  render: (m) => (
                    <strong>
                      {m.before} → {m.after}
                    </strong>
                  ),
                },
              ]}
            />
            {moves.length > limit && (
              <Button variant="outline" onClick={() => Limit(limit + 10)}>
                Mostrar más movimientos
              </Button>
            )}
          </>
        ) : (
          <AdminEmpty
            title="Sin movimientos registrados."
            description="Los ajustes y nuevos pedidos aparecerán aquí; el stock inicial no genera un historial ficticio."
          />
        )}
      </section>
    </div>
  );
}
