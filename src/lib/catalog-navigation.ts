import type { NavigateOptions } from "react-router";
/** Catalog controls update URL/results while retaining their current viewport. */
export function catalogNavigationOptions(): NavigateOptions {
  const page = document.querySelector<HTMLElement>(".catalog-page");
  if (page) {
    const top = page.getBoundingClientRect().top + window.scrollY;
    // Shorter result sets must not make the browser clamp the current scroll position.
    page.style.minHeight = `${Math.max(0, Math.ceil(window.scrollY + innerHeight - top))}px`;
    page.style.overflowAnchor = "none";
  }
  return { preventScrollReset: true, state: { preserveCatalogScroll: true, catalogScrollY: window.scrollY } };
}
