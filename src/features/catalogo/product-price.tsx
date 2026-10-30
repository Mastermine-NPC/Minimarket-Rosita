import { formatPEN } from "@/lib/currency";
export function ProductPrice({
  price,
  previous,
}: {
  price: number;
  previous?: number;
}) {
  return (
    <div className="product-price">
      <strong>{formatPEN(price)}</strong>
      {previous && previous > price ? (
        <>
          <del aria-label={"Precio anterior de prueba " + formatPEN(previous)}>
            {formatPEN(previous)}
          </del>
          <span className="offer-caption">Oferta de prueba</span>
        </>
      ) : null}
    </div>
  );
}
