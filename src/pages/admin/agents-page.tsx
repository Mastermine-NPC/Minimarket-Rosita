import { useState } from "react";
import { useRosita } from "@/hooks/use-rosita";
import { useOperation } from "@/hooks/use-operation";
import { createVerifier } from "@/lib/demo-auth";
import { isAdmin } from "@/lib/admin-operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DemoUser } from "@/types/commerce";
export function AgentsPage() {
  const { state } = useRosita();
  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <span className="eyebrow">PERSONAL DE TIENDA</span>
        <h1>Agentes de caja</h1>
        <p>
          Perfiles ficticios. La autorización local no equivale a seguridad de
          servidor. Solo se crean perfiles de caja; el registro público crea
          clientes.
        </p>
      </header>
      <AgentForm key="new" />
      <h2>Agentes registrados</h2>
      <div className="agent-list">
        {state.users
          .filter((u) => u.role === "cashier")
          .map((u) => (
            <AgentForm key={u.id} user={u} />
          ))}
      </div>
    </div>
  );
}
function AgentForm({ user }: { user?: DemoUser }) {
  const { state } = useRosita(),
    [name, Name] = useState(user?.name || ""),
    [email, Email] = useState(user?.email || ""),
    [active, Active] = useState(user?.active !== false),
    [busy, Busy] = useState(false),
    [error, Error] = useState(""),
    [reset, Reset] = useState(false),
    op = useOperation(
      () => {
        if (!user) {
          Name("");
          Email("");
        }
        Reset(false);
      },
      user ? "Agente actualizado" : "Agente creado",
    );
  async function save() {
    if (busy || !isAdmin(state)) return;
    Busy(true);
    Error("");
    try {
      const password = user?.cashierDemo ? "CajaDemo!2026" : "AgenteDemo!2026";
      const credentials =
        !user || reset ? await createVerifier(password) : undefined;
      op.run((operationId, at) => ({
        type: "agent/save",
        operationId,
        at,
        id: user?.id || crypto.randomUUID(),
        name,
        email,
        active,
        credentials,
      }));
    } catch {
      Error("No se pudo preparar el acceso local.");
    } finally {
      Busy(false);
    }
  }
  return (
    <form
      className="cash-panel customer-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <h3>{user ? "Editar " + user.name : "Crear agente de demostración"}</h3>
      <div className="coordinate-fields">
        <label>
          Nombre
          <Input value={name} onChange={(e) => Name(e.target.value)} />
        </label>
        <label>
          Correo de prueba
          <Input
            type="email"
            value={email}
            onChange={(e) => Email(e.target.value)}
          />
        </label>
      </div>
      <label>
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => Active(e.target.checked)}
        />{" "}
        Acceso activo
      </label>
      {user && (
        <label>
          <input
            type="checkbox"
            checked={reset}
            onChange={(e) => Reset(e.target.checked)}
          />{" "}
          Restablecer credenciales ficticias
        </label>
      )}
      <p className="hint">
        Perfil: agente de caja. Contraseña inicial/restablecida:{" "}
        {user?.cashierDemo ? "CajaDemo!2026" : "AgenteDemo!2026"}. No uses datos
        reales. Cierra su turno antes de desactivar el acceso.
      </p>
      <Button type="submit" disabled={busy || op.pending} aria-busy={busy}>
        {busy ? "Preparando…" : "Guardar agente"}
      </Button>
      {(error || op.error) && (
        <p role="alert" className="field-error">
          ⚠ {error || op.error}
        </p>
      )}
    </form>
  );
}
