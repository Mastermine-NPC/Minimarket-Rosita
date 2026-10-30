import { useState } from "react";
import { useRosita } from "@/hooks/use-rosita";
import { isAdmin } from "@/lib/admin-operations";
import { orderDate } from "@/lib/order-date";
import { money } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SaleReceipt } from "./sale-receipt";
export function CashHistory() {
  const { state } = useRosita(),
    [q, Q] = useState(""),
    [from, From] = useState(""),
    [to, To] = useState(""),
    [agent, Agent] = useState(""),
    [payment, Payment] = useState(""),
    [selected, Selected] = useState(""),
    admin = isAdmin(state),
    peruDay = (d: string) =>
      new Date(d).toLocaleDateString("en-CA", { timeZone: "America/Lima" }),
    sales = state.sales.filter(
      (s) =>
        (admin || s.agentId === state.sessionUserId) &&
        (!agent || s.agentId === agent) &&
        (!payment || s.payment === payment) &&
        (!from || peruDay(s.createdAt) >= from) &&
        (!to || peruDay(s.createdAt) <= to) &&
        [s.id, s.agentName, ...s.lines.map((l) => l.name)]
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(q.toLocaleLowerCase("es")),
    );
  return (
    <section className="cash-panel">
      <h2>Historial de ventas presenciales</h2>
      <div className="coordinate-fields">
        <label>
          Buscar venta o producto
          <Input value={q} onChange={(e) => Q(e.target.value)} />
        </label>
        <label>
          Medio de pago
          <select value={payment} onChange={(e) => Payment(e.target.value)}>
            <option value="">Todos</option>
            <option value="cash">Efectivo</option>
            <option value="card-demo">Tarjeta simulada</option>
          </select>
        </label>
        <label>
          Desde
          <Input
            type="date"
            value={from}
            onChange={(e) => From(e.target.value)}
          />
        </label>
        <label>
          Hasta
          <Input type="date" value={to} onChange={(e) => To(e.target.value)} />
        </label>
        {admin && (
          <label>
            Agente
            <select value={agent} onChange={(e) => Agent(e.target.value)}>
              <option value="">Todos</option>
              {state.users
                .filter((u) => u.role !== "customer")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </label>
        )}
      </div>
      <p>
        {sales.length} ventas · Total{" "}
        {money(sales.reduce((n, s) => n + s.totalCents, 0))}
      </p>
      <div className="cash-table">
        <table>
          <thead>
            <tr>
              <th>Venta / fecha</th>
              <th>Agente / turno</th>
              <th>Pago</th>
              <th>Total</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td>
                  {s.id}
                  <br />
                  {orderDate(s.createdAt)}
                </td>
                <td>
                  {s.agentName}
                  <br />
                  {s.shiftId}
                </td>
                <td>{s.payment === "cash" ? "Efectivo" : "Tarjeta demo"}</td>
                <td>{money(s.totalCents)}</td>
                <td>
                  <Button variant="outline" onClick={() => Selected(s.id)}>
                    Ver comprobante
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!sales.length && <p>No hay ventas para estos filtros.</p>}
      <SaleReceipt
        sale={sales.find((s) => s.id === selected)}
        onClose={() => Selected("")}
      />
    </section>
  );
}
