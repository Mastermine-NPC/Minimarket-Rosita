import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, isSupportedCountry, type CountryCode } from "libphonenumber-js/max";
export type PhoneKind = "mobile" | "fixed" | "other";
export { getCountries, getCountryCallingCode };
export type { CountryCode };
export function phoneCountry(value: string, fallback = "PE"): CountryCode {
  const country = isSupportedCountry(fallback) ? fallback as CountryCode : "PE";
  return parsePhoneNumberFromString(value, { defaultCountry: country, extract: false })?.country || country;
}
export function parsePhone(value: string, country = "PE") {
  return parsePhoneNumberFromString(value, { defaultCountry: isSupportedCountry(country) ? country as CountryCode : "PE", extract: false });
}
export function phoneProblem(value: string, country = "PE", kind: PhoneKind = "other"): string | null {
  if (!isSupportedCountry(country)) return "Selecciona un país válido.";
  const phone = parsePhone(value.trim(), country);
  if (!phone?.isValid()) return "Revisa el número y el país. Incluye el código de área si corresponde.";
  if (phone.ext) return "Introduce el número sin extensión.";
  const type = phone.getType();
  if (kind === "mobile" && type && !["MOBILE", "FIXED_LINE_OR_MOBILE"].includes(type)) return "El número corresponde a otro tipo de teléfono. Cambia el tipo a Fijo u Otro.";
  if (kind === "fixed" && type && !["FIXED_LINE", "FIXED_LINE_OR_MOBILE"].includes(type)) return "El número corresponde a otro tipo de teléfono. Cambia el tipo a Celular u Otro.";
  return null;
}
export function normalizePhone(value: string, country = "PE") { const phone = parsePhone(value, country); return phone?.isValid() ? phone.number : value.trim(); }
export const phoneCountries = (() => {
  const labels = new Intl.DisplayNames(["es"], { type: "region" });
  return getCountries().map(code => ({ code, name: labels.of(code) || code, prefix: "+" + getCountryCallingCode(code) })).sort((a, b) => a.name.localeCompare(b.name, "es"));
})();
