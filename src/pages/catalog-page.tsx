import { catalogNavigationOptions } from "@/lib/catalog-navigation";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useCatalog } from "@/hooks/use-catalog";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router";
import { SlidersHorizontal, SearchX, ArrowRight, X, RotateCcw, ArrowDownWideNarrow, Check } from "lucide-react";

import "@/styles/subcategories.css";
import "@/styles/catalog-controls.css";
import "@/styles/catalog-product-stage.css";

import { CatalogProductGrid } from "@/features/catalogo/catalog-product-grid";
import { CatalogFilters } from "@/features/catalogo/catalog-filters";
import {
  filterProducts,
  getFilters,
  sortOptions,
} from "@/features/catalogo/catalog-logic";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
export function CatalogPage() {
  const {
    categoryById,
    subcategoryById,
    validSubcategory,
    activeCategories,
    categoryPath,
  } = useTaxonomy();
  const products = useCatalog();
  const navigate = useNavigate(),
    wideNavigation = useMediaQuery("(min-width:1280px)");
  const { slug } = useParams(),
    category = slug ? categoryById(slug) : undefined,
    [params, SetParams] = useSearchParams(),
    f = getFilters(params),
    [open, Open] = useState(false),
    desktop = useMediaQuery("(min-width: 1024px)"),
    location = useLocation(),
    heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (location.state?.focusSearchResult && !location.state?.preserveCatalogScroll) heading.current?.focus({ preventScroll: true });
  }, [location.key, location.state]);
  useEffect(() => {
    if (
      params.has("subcategoria") &&
      (!category || !validSubcategory(category.id, f.subcategory))
    ) {
      const next = new URLSearchParams(params);
      next.delete("subcategoria");
      SetParams(next, { ...catalogNavigationOptions(), replace: true });
    }
  }, [category, params, SetParams, f.subcategory, validSubcategory]);
  useEffect(() => {
    const selected = subcategoryById(f.subcategory);
    if (
      category &&
      selected?.category === category.id &&
      selected.id !== f.subcategory
    ) {
      const next = new URLSearchParams(params);
      next.set("subcategoria", selected.id);
      SetParams(next, { ...catalogNavigationOptions(), replace: true });
    }
  }, [category, subcategoryById, f.subcategory, params, SetParams]);
  const selectedSubcategory =
    category && validSubcategory(category.id, f.subcategory)
      ? subcategoryById(f.subcategory)
      : undefined;
  const list = filterProducts(products, params, category?.id),
    brands = [
      ...new Set(
        products
          .filter(
            (p) =>
              p.active !== false && (!category || p.category === category.id),
          )
          .map((p) => p.brand),
      ),
    ].sort(),
    active =
      Number(!!selectedSubcategory) +
      Number(!!f.brand) +
      Number(params.has("max")) +
      Number(f.inStock) +
      Number(f.offers);
  function update(key: string, value: string) {
    // La URL ya refleja el último cambio aunque React aún esté renderizando.
    const next = new URLSearchParams(window.location.search);
    if (key === "*") {
      next.delete("subcategoria");
      next.delete("marca");
      next.delete("max");
      next.delete("disponibles");
      next.delete("ofertas");
    } else if (value) next.set(key, value);
    else next.delete(key);
    SetParams(next, { ...catalogNavigationOptions(), replace: true });
  }
  const filters = (
    <CatalogFilters
      params={params}
      update={update}
      brands={brands}
      category={category?.id}
      products={products}
    />
  );
  if (slug && (!category || !category.active))
    return (
      <div className="container empty-page">
        <SearchX aria-hidden="true" />
        <h1 tabIndex={-1}>No encontramos esa categoría</h1>
        <p>Explora las categorías disponibles desde el catálogo.</p>
        <Button asChild>
          <Link to="/catalogo">Ver catálogo</Link>
        </Button>
      </div>
    );
  return (
    <div className="container catalog-page">
      <nav className="breadcrumbs" aria-label="Ruta actual">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <span aria-current="page">{category?.name || "Catálogo"}</span>
      </nav>
      <div
        className={
          "catalog-heading " + (category ? "tone-" + category.tone : "")
        }
      >
        <div>
          <span className="eyebrow">
            {category ? "LO TUYO, MÁS CERCA" : "TODO EN UN SOLO LUGAR"}
          </span>
          <h1 ref={heading} tabIndex={-1}>
            {f.query
              ? "Resultados para “" + f.query + "”"
              : category?.name || "Encuentra lo que necesitas."}
          </h1>
          <p>
            {category?.description ||
              "Productos para tu casa, tus estudios y tu día a día."}
          </p>
        </div>
        <span className="catalog-heading-note">
          Precios en soles.
          <br />
          Datos de demostración.
        </span>
      </div>
      {!wideNavigation && (
        <div className="catalog-category-select">
          <label htmlFor="catalog-category">Categoría general</label>
          <select
            id="catalog-category"
            value={category?.id || ""}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              next.delete("subcategoria");
              navigate({ pathname: e.target.value ? categoryPath(activeCategories.find(c => c.id === e.target.value)!) : "/catalogo", search: next.toString() }, catalogNavigationOptions());
            }}
          >
            <option value="">Todo el catálogo</option>
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="catalog-layout">
        {desktop && (
          <aside className="filter-sidebar" data-lenis-prevent aria-label="Filtros de productos">
            {filters}
          </aside>
        )}
        <section
          className="catalog-results"
          aria-label="Resultados del catálogo"
        >
          <div className="catalog-toolbar">
            <p role="status" aria-live="polite">
              {list.length} {list.length === 1 ? "producto" : "productos"}
              {active
                ? " · " +
                  active +
                  (active === 1 ? " filtro activo" : " filtros activos")
                : ""}
            </p>
            <div className="catalog-controls">
              {!desktop && (
                <Button className="catalog-filter-trigger" variant="outline" onClick={() => Open(true)}>
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  Filtros{active ? " (" + active + ")" : ""}
                </Button>
              )}
              <label htmlFor="catalog-sort">
                <ArrowDownWideNarrow size={17} aria-hidden="true" />Ordenar por{" "}
                <select
                  id="catalog-sort"
                  value={f.sort}
                  onChange={(e) =>
                    update(
                      "orden",
                      e.target.value === "relevancia" ? "" : e.target.value,
                    )
                  }
                >
                  {sortOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {(active > 0 || f.query) && (
            <div className="active-filters">
              {selectedSubcategory && (
                <div className="subcategory-selection">
                  <span>
                    Subcategoría: <strong>{selectedSubcategory.name}</strong>
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => update("subcategoria", "")}
                    aria-label={
                      "Quitar subcategoría " + selectedSubcategory.name
                    }
                  >
                    Quitar selección <X size={15} aria-hidden="true" />
                  </Button>
                </div>
              )}
              {[
                f.query ? { key: "q", label: `“${f.query}”` } : null,
                f.brand ? { key: "marca", label: f.brand } : null,
                params.has("max") ? { key: "max", label: `Hasta S/ ${f.max}` } : null,
                f.inStock ? { key: "disponibles", label: "Disponibles" } : null,
                f.offers ? { key: "ofertas", label: "Ofertas de prueba" } : null,
              ].filter(item => item !== null).map(item => <button className="catalog-filter-chip" type="button" key={item.key} onClick={() => update(item.key, "")} aria-label={`Quitar filtro ${item.label}`}><span>{item.label}</span><X size={14} aria-hidden="true" /></button>)}
              <Button variant="link" onClick={() => SetParams({}, catalogNavigationOptions())}>
                <RotateCcw size={15} aria-hidden="true" />Limpiar búsqueda y filtros
              </Button>
            </div>
          )}
          {list.length ? (
            <CatalogProductGrid products={list} />
          ) : (
            <div className="catalog-empty">
              <span className="empty-icon">
                <SearchX size={36} aria-hidden="true" />
              </span>
              <h2>
                {active || f.query
                  ? "No encontramos coincidencias"
                  : "Aún no hay productos publicados en esta selección"}
              </h2>
              <p>Prueba otro nombre, otra marca o amplía tus filtros.</p>
              {!active && !f.query ? (
                <Button asChild>
                  <Link to={category ? "/catalogo" : "/"}>
                    {category ? "Explorar el catálogo" : "Volver al inicio"}
                  </Link>
                </Button>
              ) : (
                <Button onClick={() => SetParams({}, catalogNavigationOptions())}>
                  Limpiar búsqueda y filtros <ArrowRight aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
      <Sheet open={open && !desktop} onOpenChange={Open}>
        <SheetContent side="left" className="filter-sheet">
          <SheetHeader>
            <SheetTitle>Filtrar productos</SheetTitle>
            <SheetDescription>
              Ajusta tu selección. Los resultados se actualizan al instante.
            </SheetDescription>
          </SheetHeader>
          <div className="filter-sheet-scroll">{!desktop && filters}</div>
          <div className="filter-sheet-footer">
            <Button className="full-width" onClick={() => Open(false)}>
              <Check size={17} aria-hidden="true" />Ver {list.length} {list.length === 1 ? "producto" : "productos"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
