/**
 * Interaction state math — the JavaScript twin of `state()` and
 * `state-border()` in `packages/styles/src/utilities/_functions.scss`.
 *
 * A state colour is a tint mixed into the resting colour (the base) with
 * `color-mix(in srgb, tint N%, base)`. For opaque colours that is a plain
 * per-channel interpolation of the gamma-encoded sRGB values, which is what
 * this reproduces.
 *
 * Which colour is the tint depends on the component. A surface component — a
 * menu item, a line tab, a field border — tints with its own content colour.
 * A filled one — a button, the current page, a checked box — tints with the
 * colour opposite its label (`filled-state-tint`), so the fill moves away from
 * the label and the label gains contrast. That is why the label (`content`)
 * and the tint are separate colours here.
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
 * that matters for it: the label against a background (text has to stay
 * legible, 4.5:1), or a border against the surface it sits on (a component
 * boundary has to stay identifiable, 3:1). Without a `content` colour the
 * label is taken to be the tint, as on a surface component.
 */
export function computeStates({ mode, base, tint, content = tint, surface }) {
  const amounts = AMOUNTS[mode];
  if (!amounts) throw new Error(`Invalid mode: "${mode}"`);

  const against = mode === 'background' ? content : surface;
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

export const THEMES = ['light', 'dark'];

/**
 * The query string that reproduces a view, so a link can be shared. A preset
 * is stored by name and resolved again on load, so the link follows the
 * tokens; custom colours are stored as hex without the `#`.
 */
export function toSearch({
  theme,
  preset,
  mode,
  base,
  content,
  tint,
  surface,
}) {
  const params = new URLSearchParams({ theme });
  if (preset && preset !== 'custom') {
    params.set('preset', preset);
  } else {
    params.set('mode', mode);
    for (const [key, value] of Object.entries({
      base,
      content,
      tint,
      surface,
    })) {
      if (value) params.set(key, value.slice(1));
    }
  }
  return `?${params}`;
}

/** Reads what `toSearch()` wrote, dropping anything that does not validate. */
export function fromSearch(search) {
  const params = new URLSearchParams(search);
  const view = {};
  if (THEMES.includes(params.get('theme'))) view.theme = params.get('theme');
  if (params.get('preset')) view.preset = params.get('preset');
  if (MODES.includes(params.get('mode'))) view.mode = params.get('mode');
  for (const key of ['base', 'content', 'tint', 'surface']) {
    const value = params.has(key) && normalizeHex(params.get(key));
    if (value) view[key] = value;
  }
  return view;
}
