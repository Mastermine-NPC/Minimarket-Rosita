// Stable, asymmetric curves: the surface is shaped, never the 3D content parent.
const silhouette = "M.055.035 C.19.018 .23.052 .39.029 S.68.013 .81.035 C.89.049 .94.002 .965.052 C.99.14 .951.23 .972.39 S.988.65 .966.79 C.953.9 .986.954 .94.97 C.8.99 .72.948 .56.972 S.25.986 .13.967 C.06.954 .025.986 .032.903 C.04.8 .014.7 .03.56 S.009.27 .033.16 C.05.09 .016.049 .055.035 Z";

export function CategoryLiquidSurface({ id }: { id: string }) {
  return <>
    <span className="category-liquid-surface" aria-hidden="true" />
    <svg className="category-liquid-contour" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox"><path d={silhouette} /></clipPath>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".68" />
          <stop offset=".32" stopColor="#e8f1e9" stopOpacity=".16" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".4" />
          <stop offset="1" stopColor="#f4b8c8" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <path className="category-liquid-edge" d={silhouette} fill="none" stroke={`url(#${id}-light)`} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      <path className="category-liquid-inner-edge" d={silhouette} fill="none" stroke="#e8f1e9" strokeOpacity=".12" strokeWidth="4" vectorEffect="non-scaling-stroke" />
      <path className="category-liquid-glint" d={silhouette} fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.2" vectorEffect="non-scaling-stroke" pathLength="1000" strokeDasharray="65 935" />
    </svg>
  </>;
}
