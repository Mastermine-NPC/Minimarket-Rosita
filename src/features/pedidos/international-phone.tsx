import { useState, useRef, type Ref } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { phoneCountries, phoneCountry, parsePhone, phoneProblem, normalizePhone, getCountryCallingCode, type PhoneKind } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export function InternationalPhone({ value, country, kind, onChange, onBlur, error, inputRef }: {
  value: string; country?: string; kind?: PhoneKind; inputRef?: Ref<HTMLInputElement>;
  onChange: (value: string, country: string, kind: PhoneKind) => void;
  onBlur: () => void; error?: string;
}) {
  const selectedCountry = phoneCountries.find(item => item.code === country)?.code || phoneCountry(value, "PE");
  const selected = phoneCountries.find(item => item.code === selectedCountry)!;
  const type = kind || "other";
  const [open, setOpen] = useState(false), [search, setSearch] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const prefix = "+" + getCountryCallingCode(selectedCountry);
  const national = value.startsWith(prefix) ? value.slice(prefix.length).trimStart() : value;
  const key = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const matches = phoneCountries.filter(item => `${item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")} ${item.code} ${item.prefix}`.toLowerCase().includes(key));
  function change(raw: string) {
    const full = raw.trimStart().startsWith("+") ? raw : raw.trim() ? prefix + " " + raw : "";
    onChange(full, phoneCountry(full, selectedCountry), type);
  }
  return <div className="international-phone field">
    <Label htmlFor="delivery-phone">CEL:</Label>
    <div className="international-phone-row">
      <Button ref={trigger} type="button" variant="outline" className="phone-country-trigger" aria-label={`País y prefijo: ${selected.name} ${prefix}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setSearch(""); setOpen(true); }}><img src={`/images/flags/${selected.code}.svg`} width="24" height="16" alt="" /><span>{prefix}</span><ChevronDown size={15} aria-hidden="true" /></Button>
      <Input ref={inputRef} id="delivery-phone" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="Número de teléfono" value={national} maxLength={48} aria-invalid={!!error} aria-describedby={error ? "phone-error phone-help" : "phone-help"} onChange={event => change(event.target.value)} onBlur={() => { if (!phoneProblem(value, selectedCountry, type)) onChange(normalizePhone(value, selectedCountry), selectedCountry, type); onBlur(); }} />
    </div>
    <div className="phone-kind-row"><Label htmlFor="delivery-phone-type">Tipo de teléfono</Label><select id="delivery-phone-type" value={type} onChange={event => onChange(value, selectedCountry, event.target.value as PhoneKind)}><option value="mobile">Celular</option><option value="fixed">Fijo</option><option value="other">Otro</option></select></div>
    <p id="phone-help" className="hint">Incluye el código de área para teléfonos fijos. Puedes pegar un número con prefijo internacional.</p>
    {error && <p className="field-error" id="phone-error" role="alert">{error}</p>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="phone-country-dialog" onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus({ preventScroll: true }); }}><DialogHeader><DialogTitle>País y prefijo</DialogTitle><DialogDescription>Selecciona el país de tu teléfono.</DialogDescription></DialogHeader>
      <Label htmlFor="phone-country-search">Buscar país o código</Label><div className="phone-country-search"><Search size={17} aria-hidden="true" /><Input id="phone-country-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Perú, PE, +51…" autoComplete="off" /></div>
      <div className="phone-country-options" role="group" aria-label="Países" data-lenis-prevent>{matches.map(item => <button type="button" key={item.code} aria-pressed={item.code === selectedCountry} onClick={() => {
        // Preserve the national digits; only the country calling code changes.
        const parsed = parsePhone(value, selectedCountry);
        const digits = parsed?.nationalNumber || national;
        onChange(digits ? item.prefix + " " + digits : "", item.code, type); setOpen(false);
      }}><img src={`/images/flags/${item.code}.svg`} width="24" height="16" loading="lazy" alt="" /><span>{item.name}<small>{item.code}</small></span><strong>{item.prefix}</strong>{item.code === selectedCountry && <Check size={16} aria-hidden="true" />}</button>)}{!matches.length && <p role="status">No encontramos ese país o código.</p>}</div>
    </DialogContent></Dialog>
  </div>;
}
