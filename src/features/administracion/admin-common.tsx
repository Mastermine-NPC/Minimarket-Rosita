import type { ReactNode } from "react";
import { PackageSearch } from "lucide-react";
import { useHeadingFocus } from "@/hooks/use-heading-focus";
export function AdminHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  const heading = useHeadingFocus();
  return (
    <div className="admin-page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 ref={heading} tabIndex={-1}>
          {title}
        </h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function AdminEmpty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="admin-empty">
      <PackageSearch size={36} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  );
}
