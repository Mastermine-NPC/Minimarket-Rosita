import { catalogNavigationOptions } from "@/lib/catalog-navigation";
import { motionTokens } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function StoreSearch() {
  const [params] = useSearchParams(),
    location = useLocation();
  return (
    <SearchForm
      key={location.pathname + ":" + (params.get("q") || "")}
      initialQuery={params.get("q") || ""}
    />
  );
}
function SearchForm({ initialQuery }: { initialQuery: string }) {
  const [query, Q] = useState(initialQuery),
    [searching, Searching] = useState(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    navigate = useNavigate();
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <form
      className="store-search"
      role="search"
      aria-busy={searching}
      onSubmit={(e) => {
        e.preventDefault();
        if (searching) return;
        Searching(true);
        timer.current = setTimeout(() => {
          const current = new URL(window.location.href);
          const catalog =
              current.pathname === "/catalogo" ||
              current.pathname.startsWith("/categoria/"),
            params = new URLSearchParams(catalog ? current.search : "");
          if (query.trim()) params.set("q", query.trim());
          else params.delete("q");
          Searching(false);
          navigate(
            {
              pathname: catalog ? current.pathname : "/catalogo",
              search: params.toString(),
            },
            catalog ? catalogNavigationOptions() : { state: { focusSearchResult: true } },
          );
        }, motionTokens.search * 1000);
      }}
    >
      <Search size={20} aria-hidden="true" />
      <Input
        aria-label="Buscar productos"
        type="search"
        placeholder="¿Qué necesitas hoy?"
        value={query}
        onChange={(e) => {
          if (timer.current) clearTimeout(timer.current);
          Searching(false);
          Q(e.target.value);
        }}
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Limpiar búsqueda"
          onClick={() => Q("")}
        >
          <X size={16} aria-hidden="true" />
        </Button>
      )}
      <Button type="submit" disabled={searching} aria-busy={searching}>
        {searching ? "Buscando…" : "Buscar"}
      </Button>
      {searching && (
        <span className="search-status" role="status">
          Buscando en el catálogo de prueba…
        </span>
      )}
    </form>
  );
}
