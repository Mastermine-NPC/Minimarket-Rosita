import { useTaxonomy } from "@/hooks/use-taxonomy";

import type { Product } from "@/types/catalog";
import { filterProducts } from "./catalog-logic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getFilters } from "./catalog-logic";
import { formatPEN } from "@/lib/currency";
export function CatalogFilters({
  params,
  update,
  brands,
  category,
  products,
}: {
  params: URLSearchParams;
  update: (key: string, value: string) => void;
  brands: string[];
  category?: string;
  products: Product[];
}) {
  const { categoryById, subcategoriesFor } = useTaxonomy();
  const f = getFilters(params),
    currentCategory = category ? categoryById(category) : undefined;
  const otherFilters = new URLSearchParams(params);
  otherFilters.delete("subcategoria");
  const matching = filterProducts(products, otherFilters, category);
  const groups = category
    ? subcategoriesFor(category).filter(
        (s) =>
          s.id === f.subcategory ||
          (s.active &&
            (!s.pending ||
              products.some(
                (p) =>
                  p.active !== false &&
                  p.category === category &&
                  p.subcategory === s.id,
              ))),
      )
    : [];
  const priceLimit = Math.max(
    200,
    ...products
      .filter((p) => !category || p.category === category)
      .map((p) => Math.ceil(p.price)),
  );
  const priceValue = Math.min(priceLimit, f.max);
  return (
    <div className="catalog-filters">
      {currentCategory ? (
        <div className="filter-section subcategory-section">
          <span className="eyebrow">
            DENTRO DE {currentCategory.name.toLocaleUpperCase("es")}
          </span>
          <h2>Subcategorías</h2>
          <nav aria-label={"Subcategorías de " + currentCategory.name}>
            <Button
              type="button"
              variant="ghost"
              className="subcategory-option"
              aria-pressed={!f.subcategory}
              onClick={() => update("subcategoria", "")}
            >
              <span>Todos los productos de {currentCategory.name}</span>
              <span className="subcategory-count">{matching.length}</span>
            </Button>
            {groups.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="ghost"
                className="subcategory-option"
                aria-pressed={f.subcategory === s.id}
                onClick={() => update("subcategoria", s.id)}
              >
                <span>{s.name}</span>
                <span className="subcategory-count">
                  {matching.filter((p) => p.subcategory === s.id).length}
                </span>
              </Button>
            ))}
          </nav>
          <p className="filter-note">
            Cantidades según tus demás filtros. No representan unidades de
            stock.
          </p>
        </div>
      ) : (
        <div className="filter-section subcategory-invitation">
          <h2>Explora por subcategorías</h2>
          <p>
            Elige una categoría en la navegación o en el selector del catálogo
            para ver sus subcategorías. Aquí puedes filtrar todo el catálogo.
          </p>
        </div>
      )}
      <div className="filter-section">
        <h2>Filtros de productos</h2>
        <label htmlFor="filter-brand">Marca</label>
        <select
          id="filter-brand"
          value={f.brand}
          onChange={(e) => update("marca", e.target.value)}
        >
          <option value="">Todas las marcas</option>
          {f.brand && !brands.includes(f.brand) && (
            <option value={f.brand}>{f.brand} (sin coincidencias)</option>
          )}
          {brands.map((brand) => (
            <option key={brand}>{brand}</option>
          ))}
        </select>
        <label htmlFor="filter-price">
          Precio máximo <strong>{formatPEN(priceValue)}</strong>
        </label>
        <Input
          id="filter-price"
          type="range"
          min={1}
          max={priceLimit}
          step={1}
          value={priceValue}
          onChange={(e) =>
            update(
              "max",
              Number(e.target.value) === priceLimit ? "" : e.target.value,
            )
          }
        />
        <div className="range-labels">
          <span>S/ 1</span>
          <span>{formatPEN(priceLimit)}</span>
        </div>
        <label className="checkbox-label">
          <Checkbox
            checked={f.inStock}
            onCheckedChange={(checked) =>
              update("disponibles", checked === true ? "1" : "")
            }
          />
          Solo disponibles
        </label>
        <label className="checkbox-label">
          <Checkbox
            checked={f.offers}
            onCheckedChange={(checked) =>
              update("ofertas", checked === true ? "1" : "")
            }
          />
          Ofertas de prueba
        </label>
        <Button variant="outline" onClick={() => update("*", "")}>
          Limpiar filtros
        </Button>
      </div>
      <p className="filter-note">
        Precios e inventario de demostración. No se realizan cobros.
      </p>
    </div>
  );
}
