/** Coordenadas en la imagen realmente visible, no en sus márgenes contain. */
export function containSize(
  width: number,
  height: number,
  naturalWidth: number,
  naturalHeight: number,
  maximumUpscale = Infinity,
) {
  const factor = Math.min(
    width / naturalWidth,
    height / naturalHeight,
    maximumUpscale,
  );
  return { width: naturalWidth * factor, height: naturalHeight * factor };
}
export function imagePoint(
  x: number,
  y: number,
  width: number,
  height: number,
  naturalWidth: number,
  naturalHeight: number,
  maximumUpscale = Infinity,
) {
  const fit = containSize(
    width,
    height,
    naturalWidth,
    naturalHeight,
    maximumUpscale,
  );
  const left = (width - fit.width) / 2,
    top = (height - fit.height) / 2;
  if (x < left || x > left + fit.width || y < top || y > top + fit.height)
    return null;
  return {
    x: Math.max(0, Math.min(1, (x - left) / fit.width)),
    y: Math.max(0, Math.min(1, (y - top) / fit.height)),
  };
}
export function panBounds(
  width: number,
  height: number,
  naturalWidth: number,
  naturalHeight: number,
  scale: number,
  maximumUpscale = Infinity,
) {
  const fit = containSize(
    width,
    height,
    naturalWidth,
    naturalHeight,
    maximumUpscale,
  );
  return {
    x: Math.max(0, (fit.width * scale - width) / 2),
    y: Math.max(0, (fit.height * scale - height) / 2),
  };
}
export const clamp = (value: number, maximum: number) =>
  Math.max(-maximum, Math.min(maximum, value));
