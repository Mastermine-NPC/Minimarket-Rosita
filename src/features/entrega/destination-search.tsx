import { useEffect, useRef, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPlaces } from "@/lib/geocoding";
import type { GeoPoint } from "@/types/operations";
export function DestinationSearch({ origin, onSelect, embedded = false }: { origin: GeoPoint; onSelect: (point: GeoPoint) => void; embedded?: boolean }) {
  const [query, setQuery] = useState(""), [results, setResults] = useState<GeoPoint[]>([]), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function search(event?: React.FormEvent) {
    event?.preventDefault(); request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setResults([]); setMessage("");
    try {
      const places = await searchPlaces(query, origin, controller.signal);
      if (controller.signal.aborted) return;
      setResults(places); setMessage(places.length ? `${places.length} ubicaciones. Selecciona tu destino.` : "No encontramos esa dirección. Añade la ciudad o elige un punto en el mapa.");
    } catch (error) {
      if (!controller.signal.aborted) { console.debug("Destination search failed", error); setMessage("No pudimos buscar la dirección. Comprueba la conexión e inténtalo nuevamente, o elige un punto en el mapa."); }
    } finally { if (!controller.signal.aborted) setBusy(false); }
  }
  const Container = embedded ? "div" : "form";
  return <div className="destination-search">
    <Container onSubmit={search} onKeyDown={event => { if (embedded && event.key === "Enter" && (event.target as HTMLElement).id === "destination-query") { event.preventDefault(); if (!busy && query.trim().length >= 3) void search(); } }} role="search" aria-label="Buscar destino de simulación">
      <label htmlFor="destination-query">Buscar dirección o lugar</label>
      <div className="destination-search-row"><Input id="destination-query" value={query} minLength={3} maxLength={200} required={!embedded} placeholder="Dirección, zona o ciudad" autoComplete="off" onChange={e => { request.current?.abort(); setBusy(false); setQuery(e.target.value); setResults([]); setMessage(""); }} /><Button type={embedded ? "button" : "submit"} onClick={embedded ? () => void search() : undefined} variant="outline" disabled={busy || query.trim().length < 3}><Search size={17} aria-hidden="true" />{busy ? "Buscando…" : "Buscar"}</Button></div>
    </Container>
    {message && <p className="tracking-hint" role="status">{message}</p>}
    {!!results.length && <ul className="destination-results" aria-label="Ubicaciones encontradas">{results.map((p, i) => <li key={`${p.lat},${p.lng},${i}`}><button type="button" onClick={() => { onSelect(p); setResults([]); setMessage(""); }}><MapPin size={18} aria-hidden="true" /><span>{p.label}</span></button></li>)}</ul>}
    <small className="tracking-attribution">Búsqueda: <a href="https://photon.komoot.io" target="_blank" rel="noopener noreferrer">Photon</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></small>
  </div>;
}
