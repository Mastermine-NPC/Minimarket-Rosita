import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
export function QuantitySelector({
  value,
  max,
  onChange,
  name,
  min = 1,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  name: string;
  min?: number;
}) {
  return (
    <div
      className="quantity-selector"
      role="group"
      aria-label={"Cantidad de " + name}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label={"Disminuir " + name}
        disabled={value <= min}
        title={value <= min ? "Cantidad mínima: " + min : undefined}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={16} aria-hidden="true" />
      </Button>
      <output aria-live="polite">{value}</output>
      <Button
        variant="ghost"
        size="icon"
        aria-label={"Aumentar " + name}
        disabled={value >= max}
        title={value >= max ? "Alcanzaste el stock disponible" : undefined}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}
