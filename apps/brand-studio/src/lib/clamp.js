/**
 * A escala tipográfica da marca é fluida: cada degrau é um `clamp()` que
 * interpola entre um tamanho mínimo e um máximo ao longo de uma faixa de
 * viewport. Editar essa string à mão é inviável, então a interface expõe só o
 * mínimo e o máximo em `rem` e recompõe o `clamp()` aqui.
 */

const ROOT_FONT_SIZE = 16;

/** Faixa de viewport usada pela escala original do Let's UI. */
export const DEFAULT_VIEWPORT = { min: 320, max: 1440 };

const CLAMP_PATTERN =
  /^clamp\(\s*([\d.]+)rem\s*,\s*(-?[\d.]+)rem\s*([+-])\s*([\d.]+)vw\s*,\s*([\d.]+)rem\s*\)$/;

/** Extrai `{ min, max }` em rem de um `clamp()` — `null` se não for uma escala fluida. */
export function parseClamp(value) {
  const match = String(value).trim().match(CLAMP_PATTERN);
  if (!match) return null;
  return { min: Number(match[1]), max: Number(match[5]) };
}

/** Monta o `clamp()` fluido entre `min` e `max` (rem) para a faixa de viewport. */
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
