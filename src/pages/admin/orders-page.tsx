import { useState } from "react";
import { Link } from "react-router";
import { useRosita } from "@/hooks/use-rosita";
import { orderStages } from "@/data/delivery";
import { orderDate } from "@/lib/order-date";
import { money } from "@/lib/currency";
import { normalizeText } from "@/features/catalogo/catalog-logic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AdminHeading,
  AdminEmpty,
} from "@/features/administracion/admin-common";
import { AdminTable, Pagination } from "@/features/administracion/admin-table";
export function AdminOrdersPage() {
  const { state } = useRosita(),
    [q, Q] = useState(""),
    [status, Status] = useState(""),
    [from, From] = useState(""),
    [to, To] = useState(""),
    [sort, Sort] = useState("reciente"),
    [page, Page] = useState(1);
  const invalid = !!from && !!to && from > to,
    result = state.orders
      .filter((o) => {
        const user = state.users.find((u) => u.id === o.userId),
          d = new Date(o.createdAt),
          day = [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0"),
          ].join("-");
        return (
          !invalid &&
          normalizeText(
            o.id +
              " " +
              (o.customerName || user?.name || "") +
              " " +
              (o.customerEmail || user?.email || ""),
          ).includes(normalizeText(q)) &&
          (!status || String(o.status) === status) &&
          (!from || day >= from) &&
          (!to || day <= to)
        );
      })
      .sort((a, b) =>
        sort === "antiguo"
          ? a.createdAt.localeCompare(b.createdAt)
          : sort === "importe"
            ? b.totalCents - a.totalCents
            : b.createdAt.localeCompare(a.createdAt),
      ),
    pages = Math.max(1, Math.ceil(result.length / 10)),
    current = Math.min(page, pages);
  function clear() {
    Q("");
    Status("");
    From("");
    To("");
    Sort("reciente");
    Page(1);
  }
  return (
    <div className="admin-page">
      <AdminHeading
        eyebrow="PEDIDOS DIGITALES DE CLIENTES"
        title="Cada pedido, en su lugar."
        description="Supervisa compras de demostración y avanza la entrega manualmente. No son pagos cobrados ni repartos reales."
      />
      <div className="admin-filters admin-order-filters">
        <div>
          <label htmlFor="orders-search">Identificador o cliente</label>
          <Input
            id="orders-search"
            value={q}
            onChange={(e) => {
              Q(e.target.value);
              Page(1);
            }}
          />
        </div>
        <div>
          <label htmlFor="orders-status">Estado</label>
          <select
            id="orders-status"
            value={status}
            onChange={(e) => {
              Status(e.target.value);
              Page(1);
            }}
          >
            <option value="">Todos</option>
            {orderStages.map((s, i) => (
              <option key={s} value={i}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="orders-from">Desde</label>
          <Input
            id="orders-from"
            type="date"
            value={from}
            onChange={(e) => {
              From(e.target.value);
              Page(1);
            }}
          />
        </div>
        <div>
          <label htmlFor="orders-to">Hasta</label>
          <Input
            id="orders-to"
            type="date"
            value={to}
            onChange={(e) => {
              To(e.target.value);
              Page(1);
            }}
            aria-invalid={invalid}
            aria-describedby={invalid ? "orders-date-error" : undefined}
          />
        </div>
        <div>
          <label htmlFor="orders-sort">Orden</label>
          <select
            id="orders-sort"
            value={sort}
            onChange={(e) => Sort(e.target.value)}
          >
            <option value="reciente">Más reciente</option>
            <option value="antiguo">Más antiguo</option>
            <option value="importe">Mayor importe</option>
          </select>
        </div>
        <Button variant="outline" onClick={clear}>
          Limpiar filtros
        </Button>
      </div>
      {invalid && (
        <p role="alert" className="field-error" id="orders-date-error">
          La fecha final no puede ser anterior a la inicial.
        </p>
      )}
      <section className="admin-panel admin-table-panel">
        {result.length ? (
          <>
            <AdminTable
              label="Pedidos de clientes"
              rows={result.slice((current - 1) * 10, current * 10)}
              rowKey={(o) => o.id}
              columns={[
                {
                  key: "order",
                  label: "Pedido",
                  render: (o) => (
                    <div>
                      <Link
                        to={"/admin/pedidos/" + o.id}
                        className="admin-order-id"
                      >
                        {o.id}
                      </Link>
                      <small>{orderDate(o.createdAt)}</small>
                    </div>
                  ),
                },
                {
                  key: "customer",
                  label: "Cliente de demostración",
                  render: (o) => (
                    <div>
                      <strong>
                        {o.customerName ||
                          state.users.find((u) => u.id === o.userId)?.name}
                      </strong>
                      <small>
                        {o.customerEmail ||
                          state.users.find((u) => u.id === o.userId)?.email}
                      </small>
                    </div>
                  ),
                },
                {
                  key: "status",
                  label: "Estado",
                  render: (o) => (
                    <span className="status-chip">{orderStages[o.status]}</span>
                  ),
                },
                {
                  key: "total",
                  label: "Importe total",
                  render: (o) => (
                    <strong className="tabular">{money(o.totalCents)}</strong>
                  ),
                },
                {
                  key: "actions",
                  label: "Acción",
                  render: (o) => (
                    <Button asChild variant="outline">
                      <Link to={"/admin/pedidos/" + o.id}>Ver pedido</Link>
                    </Button>
                  ),
                },
              ]}
            />
            <Pagination
              page={current}
              pages={pages}
              total={result.length}
              onChange={Page}
            />
          </>
        ) : (
          <AdminEmpty
            title="No hay pedidos que mostrar."
            description="Prueba otros filtros o crea un pedido desde la tienda con un cliente de prueba."
          >
            <Button variant="outline" onClick={clear}>
              Limpiar filtros
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Consultar tienda</Link>
            </Button>
          </AdminEmpty>
        )}
      </section>
    </div>
  );
}
