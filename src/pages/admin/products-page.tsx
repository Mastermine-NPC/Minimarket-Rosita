import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useState } from "react";
import { Link } from "react-router";
import { Plus, Pencil } from "lucide-react";
import { useRosita } from "@/hooks/use-rosita";
import { useCatalog } from "@/hooks/use-catalog";
import { normalizeText } from "@/features/catalogo/catalog-logic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/features/catalogo/product-image";
import { ProductEditor } from "@/features/administracion/product-editor";
import { ConfirmAction } from "@/components/operation-confirmation";
import { AdminTable, Pagination } from "@/features/administracion/admin-table";
import {
  AdminHeading,
  AdminEmpty,
} from "@/features/administracion/admin-common";
import { money } from "@/lib/currency";
export function AdminProductsPage() {
  const { categories, categoryById, subcategoryById } = useTaxonomy();
  const { state } = useRosita(),
    all = useCatalog().map((p) => ({
      ...p,
      commercialVisibility: p.active,
      active: state.products.find((r) => r.id === p.id)?.active,
    })),
    [q, Q] = useState(""),
    [category, Category] = useState(""),
    [status, Status] = useState(""),
    [sort, Sort] = useState("nombre"),
    [page, Page] = useState(1);
  const result = all
      .filter(
        (p) =>
          normalizeText(p.id + " " + p.name + " " + p.brand).includes(
            normalizeText(q),
          ) &&
          (!category || p.category === category) &&
          (!status || (status === "activo" ? p.active : !p.active)),
      )
      .sort((a, b) =>
        sort === "precio-asc"
          ? a.price - b.price
          : sort === "precio-desc"
            ? b.price - a.price
            : a.name.localeCompare(b.name, "es"),
      ),
    pages = Math.max(1, Math.ceil(result.length / 10)),
    current = Math.min(page, pages);
  function clear() {
    Q("");
    Category("");
    Status("");
    Sort("nombre");
    Page(1);
  }
  return (
    <div className="admin-page">
      <AdminHeading
        eyebrow="CATÁLOGO COMPARTIDO"
        title="Productos con todo en orden."
        description="Crea y edita la información comercial. Las existencias posteriores se ajustan en Inventario."
      >
        <ProductEditor
          trigger={
            <Button>
              <Plus aria-hidden="true" />
              Nuevo producto
            </Button>
          }
        />
      </AdminHeading>
      <div className="admin-filters">
        <div>
          <label htmlFor="admin-products-search">Buscar producto</label>
          <Input
            id="admin-products-search"
            type="search"
            placeholder="Nombre, marca o identificador"
            value={q}
            onChange={(e) => {
              Q(e.target.value);
              Page(1);
            }}
          />
        </div>
        <div>
          <label htmlFor="admin-products-category">Categoría</label>
          <select
            id="admin-products-category"
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
          <label htmlFor="admin-products-status">Estado</label>
          <select
            id="admin-products-status"
            value={status}
            onChange={(e) => {
              Status(e.target.value);
              Page(1);
            }}
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Desactivado</option>
          </select>
        </div>
        <div>
          <label htmlFor="admin-products-sort">Ordenar</label>
          <select
            id="admin-products-sort"
            value={sort}
            onChange={(e) => Sort(e.target.value)}
          >
            <option value="nombre">Nombre A–Z</option>
            <option value="precio-asc">Menor precio</option>
            <option value="precio-desc">Mayor precio</option>
          </select>
        </div>
        <Button variant="outline" onClick={clear}>
          Limpiar filtros
        </Button>
      </div>
      <section className="admin-panel admin-table-panel">
        {result.length ? (
          <>
            <AdminTable
              label="Productos de Rosita"
              rows={result.slice((current - 1) * 10, current * 10)}
              rowKey={(p) => p.id}
              columns={[
                {
                  key: "product",
                  label: "Producto",
                  render: (p) => (
                    <div className="admin-product-cell">
                      <ProductImage product={p} />
                      <div>
                        <strong>{p.name}</strong>
                        <small>
                          {p.id} · {p.brand}
                        </small>
                        <span>{p.presentation}</span>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "category",
                  label: "Categoría",
                  render: (p) => (
                    <div>
                      {categoryById(p.category)?.name}
                      <small>
                        {subcategoryById(p.subcategory)?.name}
                        {subcategoryById(p.subcategory)?.pending
                          ? " · revisar"
                          : ""}
                      </small>
                    </div>
                  ),
                },
                {
                  key: "price",
                  label: "Precio",
                  render: (p) => (
                    <strong className="tabular">
                      {money(state.inventory[p.id].priceCents)}
                    </strong>
                  ),
                },
                {
                  key: "stock",
                  label: "Stock",
                  render: (p) => (
                    <Link to={"/admin/inventario?q=" + p.id}>
                      {p.stock} unidades
                    </Link>
                  ),
                },
                {
                  key: "status",
                  label: "Estado",
                  render: (p) => (
                    <span
                      className={
                        "status-chip " + (!p.active ? "status-muted" : "")
                      }
                    >
                      {p.active ? "Activo" : "Desactivado"}
                      {p.active && !p.commercialVisibility && (
                        <small>
                          Oculto por categoría o subcategoría inactiva
                        </small>
                      )}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  label: "Acciones",
                  render: (p) => {
                    const record = state.products.find((v) => v.id === p.id)!;
                    return (
                      <div className="admin-row-actions">
                        <ProductEditor
                          product={record}
                          trigger={
                            <Button
                              variant="outline"
                              aria-label={"Editar " + p.id}
                            >
                              <Pencil size={15} aria-hidden="true" />
                              Editar
                            </Button>
                          }
                        />
                        <ConfirmAction
                          trigger={
                            <Button
                              variant="ghost"
                              aria-label={
                                (p.active ? "Desactivar " : "Activar ") + p.id
                              }
                            >
                              {p.active ? "Desactivar" : "Activar"}
                            </Button>
                          }
                          title={
                            p.active
                              ? "¿Desactivar este producto?"
                              : "¿Activar este producto?"
                          }
                          description={
                            p.active
                              ? "Dejará de ofrecerse para nuevas compras. Los pedidos históricos se conservan y los carritos deberán corregirse."
                              : "Volverá a ofrecerse en la tienda con su precio y stock actuales."
                          }
                          label={
                            p.active
                              ? "Confirmar desactivación"
                              : "Confirmar activación"
                          }
                          success="Estado del producto actualizado"
                          build={(operationId, at) => ({
                            type: "admin/product-active",
                            operationId,
                            at,
                            id: p.id,
                            active: !p.active,
                            expectedUpdatedAt: record.updatedAt,
                          })}
                        />
                      </div>
                    );
                  },
                },
              ]}
            />
            <Pagination
              total={result.length}
              page={current}
              pages={pages}
              onChange={Page}
            />
          </>
        ) : (
          <AdminEmpty
            title="No encontramos productos."
            description="Prueba otro nombre o limpia los filtros."
          >
            <Button variant="outline" onClick={clear}>
              Limpiar filtros
            </Button>
          </AdminEmpty>
        )}
      </section>
      <p className="hint">
        Los identificadores son estables. No se borran productos ni referencias
        de pedidos anteriores.
      </p>
    </div>
  );
}
