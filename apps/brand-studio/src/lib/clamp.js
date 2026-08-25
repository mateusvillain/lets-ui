/**
 * The brand's type scale is fluid: every step is a `clamp()` interpolating
 * between a minimum and a maximum size across a viewport range. Editing that
 * string by hand is unworkable, so the interface exposes only the minimum and
 * the maximum in `rem` and recomposes the `clamp()` here.
 */

const ROOT_FONT_SIZE = 16;

/** Viewport range used by the original Let's UI scale. */
export const DEFAULT_VIEWPORT = { min: 320, max: 1440 };

const CLAMP_PATTERN =
  /^clamp\(\s*([\d.]+)rem\s*,\s*(-?[\d.]+)rem\s*([+-])\s*([\d.]+)vw\s*,\s*([\d.]+)rem\s*\)$/;

/** Extracts `{ min, max }` in rem from a `clamp()` — `null` if not a fluid scale. */
export function parseClamp(value) {
  const match = String(value).trim().match(CLAMP_PATTERN);
  if (!match) return null;
  return { min: Number(match[1]), max: Number(match[5]) };
}

/** Builds the fluid `clamp()` between `min` and `max` (rem) for the viewport range. */
export function buildClamp(min, max, viewport = DEFAULT_VIEWPORT) {
  const round = (n) => Number(n.toFixed(4));

  const minPx = min * ROOT_FONT_SIZE;
  const maxPx = max * ROOT_FONT_SIZE;
  const slope = (maxPx - minPx) / (viewport.max - viewport.min);
  const intercept = (minPx - slope * viewport.min) / ROOT_FONT_SIZE;

  return `clamp(${round(min)}rem, ${round(intercept)}rem + ${round(
    slope * 100
  )}vw, ${round(max)}rem)`;
}
