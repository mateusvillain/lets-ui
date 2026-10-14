/**
 * Interaction state math — the JavaScript twin of `state()` and
 * `state-border()` in `packages/styles/src/utilities/_functions.scss`.
 *
 * A state colour is the content colour (the tint) mixed into the resting
 * colour (the base) with `color-mix(in srgb, tint N%, base)`. For opaque
 * colours that is a plain per-channel interpolation of the gamma-encoded sRGB
 * values, which is what this reproduces.
 */

// Keep in sync with `$state-amounts` and `$state-border-amounts`.
export const AMOUNTS = {
  background: { hover: 8, pressed: 16 },
  border: { hover: 40, pressed: 56 },
};

export const MODES = Object.keys(AMOUNTS);

/** Accepts `#abc`, `abc`, `#aabbcc` and returns `#aabbcc`, or null. */
export function normalizeHex(input) {
  let hex = String(input).trim().replace(/^#/, '');
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return `#${hex.toLowerCase()}`;
}

export function hexToRgb(hex) {
  const value = normalizeHex(hex);
  if (!value) throw new Error(`Invalid colour: "${hex}"`);
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
}

export function rgbToHex(rgb) {
  return `#${rgb
    .map((n) =>
      Math.round(Math.min(1, Math.max(0, n)) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

/**
 * Reads what `getComputedStyle()` returns for a colour — `rgb(…)`, `rgba(…)`
 * or `color(srgb …)` — and returns it as hex. Alpha is ignored: the tokens the
 * calculator reads are opaque.
 */
export function cssColorToHex(css) {
  const value = String(css).trim();
  const srgb = value.match(/^color\(srgb\s+([^)]+)\)$/);
  if (srgb) {
    const [r, g, b] = srgb[1].split(/[\s/]+/).map(Number);
    return rgbToHex([r, g, b]);
  }
  const rgb = value.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const [r, g, b] = rgb[1]
      .split(/[\s,/]+/)
      .slice(0, 3)
      .map((part) =>
        part.endsWith('%') ? parseFloat(part) / 100 : Number(part) / 255
      );
    return rgbToHex([r, g, b]);
  }
  return normalizeHex(value);
}

/** `color-mix(in srgb, tint amount%, base)` for opaque colours. */
export function mix(tint, base, amount) {
  const t = hexToRgb(tint);
  const b = hexToRgb(base);
  const p = amount / 100;
  return rgbToHex(t.map((channel, i) => channel * p + b[i] * (1 - p)));
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two colours. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The resting, hover and pressed colours for one mode, each with the contrast
 * that matters for it: the content colour against a background (text has to
 * stay legible, 4.5:1), or a border against the surface it sits on (a
 * component boundary has to stay identifiable, 3:1).
 */
export function computeStates({ mode, base, tint, surface }) {
  const amounts = AMOUNTS[mode];
  if (!amounts) throw new Error(`Invalid mode: "${mode}"`);

  const against = mode === 'background' ? tint : surface;
  const state = (name, amount, color) => ({
    name,
    amount,
    color,
    contrast: contrast(color, against),
  });

  return [
    state('rest', 0, normalizeHex(base)),
    state('hover', amounts.hover, mix(tint, base, amounts.hover)),
    state('pressed', amounts.pressed, mix(tint, base, amounts.pressed)),
  ];
}
