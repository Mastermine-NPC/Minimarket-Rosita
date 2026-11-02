import { useState } from "react";
import { Link } from "react-router";
import { useRosita } from "@/hooks/use-rosita";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
import { normalizeText } from "@/features/catalogo/catalog-logic";
import { Input } from "@/components/ui/input";
export function CustomersPage() {
  const { state } = useRosita();
  const [query, setQuery] = useState("");
  const heading = useHeadingFocus();
  const customers = state.users.filter(user => user.role === "customer" && normalizeText(user.name + " " + user.email).includes(normalizeText(query)));
  return <div className="admin-page"><header className="admin-page-heading"><div><h1 ref={heading} tabIndex={-1}>Clientes</h1><p>Cuentas locales y sus pedidos de demostración.</p></div></header>
    <section className="admin-panel"><label htmlFor="customer-search">Buscar por nombre o correo</label><Input id="customer-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre o correo"/>
      <p className="hint">{customers.length} cuentas de cliente</p>
      <div className="admin-table-scroll"><table className="customer-directory"><thead><tr><th>Cliente</th><th>Correo</th><th>Pedidos</th><th>Registro</th></tr></thead><tbody>{customers.map(user => <tr key={user.id}><td data-label="Cliente"><strong>{user.name}</strong></td><td data-label="Correo">{user.email}</td><td data-label="Pedidos">{state.orders.filter(order => order.userId === user.id).length}</td><td data-label="Registro">{new Date(user.createdAt).toLocaleDateString("es-PE")}</td></tr>)}</tbody></table></div>
      {!customers.length && <p role="status">No hay clientes que coincidan con esta búsqueda.</p>}
      <Link className="text-link" to="/admin/pedidos">Consultar pedidos →</Link>
    </section></div>;
}
