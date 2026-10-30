import { useRef, useState } from "react";
import { useRosita } from "@/hooks/use-rosita";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money } from "@/lib/currency";
import { priceCart } from "@/lib/cart-pricing";
import { CameraScanner } from "./camera-scanner";
export function CashCatalog({ disabled }: { disabled: boolean }) {
  const { state, dispatch } = useRosita(),
    { categories, subcategoriesFor } = useTaxonomy(),
    [search, Search] = useState(""),
    [category, Category] = useState(""),
    [subcategory, Subcategory] = useState(""),
    [code, Code] = useState(""),
    [demo, Demo] = useState(""),
    [message, Message] = useState(""),
    scanner = useRef<HTMLInputElement>(null),
    scanning = useRef("");
  const available = state.products.filter(
      (p) => !priceCart({ ...state, cart: { [p.id]: 1 } }).error,
    ),
    results = available.filter(
      (p) =>
        (!category || p.category === category) &&
        (!subcategory || p.subcategory === subcategory) &&
        [p.name, p.brand, p.code || p.id, p.barcode || ""]
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(search.toLocaleLowerCase("es")),
    );
  function add(id: string) {
    dispatch({
      type: "cash/cart",
      kind: "add",
      id,
      quantity: 1,
      token: crypto.randomUUID(),
    });
  }
  function scan(value: string) {
    const cleaned = value.trim();
    if (disabled) {
      Message("Abre un turno para agregar artículos.");
      return;
    }
    if (!cleaned) {
      Message("Introduce un código primero.");
      return;
    }
    const product = state.products.find(
      (p) => p.barcode === cleaned || (p.code || p.id) === cleaned,
    );
    if (!product) {
      Message("Código desconocido. Busca por nombre o marca.");
      return;
    }
    const qty =
        (state.cashDrafts[state.sessionUserId || ""]?.cart[product.id] || 0) +
        1,
      problem = priceCart({ ...state, cart: { [product.id]: qty } }).error;
    if (problem) {
      Message(problem);
      return;
    }
    add(product.id);
    Message("✓ " + product.name + " agregado a la venta.");
  }
  return (
    <section className="cash-panel">
      <h2>Seleccionar productos</h2>
      <div className="customer-form">
        <Label htmlFor="cash-scan">Escanear o ingresar código</Label>
        <Input
          ref={scanner}
          id="cash-scan"
          value={code}
          disabled={disabled}
          onChange={(e) => {
            Code(e.target.value);
            scanning.current = e.target.value;
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (e.repeat || !scanning.current.trim()) return;
            const value = scanning.current;
            scanning.current = "";
            Code("");
            scan(value);
            scanner.current?.focus();
          }}
          autoComplete="off"
        />
        <p className="hint">
          Compatible con lectores que escriben como teclado y terminan con
          Enter. Solo escucha este campo.
        </p>
        <label>
          Código ficticio para simular lectura
          <select value={demo} onChange={(e) => Demo(e.target.value)}>
            <option value="">Elige un producto</option>
            {available.map((p) => (
              <option key={p.id} value={p.barcode || p.code || p.id}>
                {p.name} · {p.barcode || p.code || p.id}
              </option>
            ))}
          </select>
        </label>
        <div className="customer-actions">
          <Button
            variant="outline"
            disabled={disabled || !demo}
            onClick={() => scan(demo)}
          >
            Simular lectura
          </Button>
          {!disabled && <CameraScanner onRead={scan} />}
        </div>
        <p role="status">{message}</p>
        <Label htmlFor="cash-search">
          Buscar por nombre, marca, SKU o código de barras
        </Label>
        <Input
          id="cash-search"
          value={search}
          onChange={(e) => Search(e.target.value)}
        />
        <div className="coordinate-fields">
          <label>
            Categoría
            <select
              value={category}
              onChange={(e) => {
                Category(e.target.value);
                Subcategory("");
              }}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Subcategoría
            <select
              value={subcategory}
              disabled={!category}
              onChange={(e) => Subcategory(e.target.value)}
            >
              <option value="">Todas</option>
              {subcategoriesFor(category).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <p role="status">{results.length} productos disponibles</p>
      <div className="cash-products">
        {results.map((p) => (
          <article key={p.id} className="cash-product">
            <strong>{p.name}</strong>
            <small>
              {p.brand} · {p.presentation}
              <br />
              {p.code || p.id} · {p.barcode}
            </small>
            <span>
              {money(state.inventory[p.id].priceCents)} · Stock{" "}
              {state.inventory[p.id].stock}
            </span>
            <Button
              variant="outline"
              disabled={disabled}
              onClick={() => add(p.id)}
            >
              Agregar {p.name}
            </Button>
          </article>
        ))}
      </div>
      {!results.length && (
        <p>Sin coincidencias. Cambia la búsqueda o limpia los filtros.</p>
      )}
    </section>
  );
}
