import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
export function NotFoundPage() {
  const heading = useHeadingFocus();
  return (
    <div className="container empty-page">
      <span className="eyebrow">404 · ROSITA</span>
      <h1 ref={heading} tabIndex={-1}>
        Por aquí todavía no hay nada.
      </h1>
      <p>Vuelve a la tienda y encuentra lo que necesitas.</p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
