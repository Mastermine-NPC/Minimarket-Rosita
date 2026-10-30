import { Link } from "react-router";
import {
  Store,
  Mail,
  HelpCircle,
  BookOpen,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
const helpLinks = [
  { to: "/nosotros", label: "Nosotros", icon: Store, group: "Rosita" },
  { to: "/contacto", label: "Contacto", icon: Mail, group: "Rosita" },
  {
    to: "/ayuda",
    label: "Centro de ayuda",
    icon: HelpCircle,
    group: "Te acompañamos",
  },
  {
    to: "/ayuda#preguntas-frecuentes",
    label: "Preguntas frecuentes",
    icon: BookOpen,
    group: "Te acompañamos",
  },
  {
    to: "/ayuda#como-comprar",
    label: "Cómo comprar",
    icon: ShoppingBag,
    group: "Te acompañamos",
  },
  {
    to: "/ayuda#entregas-pagos",
    label: "Entregas y pagos de demostración",
    icon: Truck,
    group: "Te acompañamos",
  },
];
export function HelpMenuLinks() {
  return (
    <nav className="help-menu-links" aria-label="Información y ayuda">
      {["Rosita", "Te acompañamos"].map((group) => (
        <section key={group}>
          <h2>{group}</h2>
          {helpLinks
            .filter((x) => x.group === group)
            .map((x) => (
              <SheetClose asChild key={x.to}>
                <Link to={x.to}>
                  <x.icon size={19} aria-hidden="true" />
                  <span>{x.label}</span>
                </Link>
              </SheetClose>
            ))}
        </section>
      ))}
    </nav>
  );
}
