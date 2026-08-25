/**
 * Conversões de cor e geração de escalas.
 *
 * Os tokens de cor do Let's UI são objetos DTCG `srgb` com `components`
 * normalizados (0–1) e um `hex` de conveniência. A interface trabalha em hex e
 * converte nas bordas.
 */

export function hexToComponents(hex) {
  const value = normalizeHex(hex);
  return [
    parseInt(value.slice(1, 3), 16) / 255,
    parseInt(value.slice(3, 5), 16) / 255,
    parseInt(value.slice(5, 7), 16) / 255,
  ];
}

export function componentsToHex([r, g, b]) {
  const channel = (n) =>
    Math.round(Math.min(1, Math.max(0, n)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** Aceita `#abc`, `abc`, `#aabbcc` e devolve sempre `#aabbcc`. */
export function normalizeHex(input) {
  let hex = String(input).trim().replace(/^#/, '');
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#000000';
  return `#${hex.toLowerCase()}`;
}

export function isValidHex(input) {
  const hex = String(input).trim().replace(/^#/, '');
  return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

/** Valor DTCG de cor a partir de um hex. */
export function hexToTokenValue(hex) {
  const value = normalizeHex(hex);
  return {
    colorSpace: 'srgb',
    components: hexToComponents(value),
    alpha: 1,
    hex: value,
  };
}

/** Hex a partir de um valor DTCG de cor (usa `hex` quando presente). */
export function tokenValueToHex(value) {
  if (typeof value === 'string') return normalizeHex(value);
  if (value?.hex) return normalizeHex(value.hex);
  if (value?.components) return componentsToHex(value.components);
  return '#000000';
}

export function hexToHsl(hex) {
  const [r, g, b] = hexToComponents(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }

  return { h: (h + 360) % 360, s, l };
}

export function hslToHex({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const sector = Math.floor((((h % 360) + 360) % 360) / 60);
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][sector];

  return componentsToHex([r + m, g + m, b + m]);
}

/**
 * Curvas extraídas da marca de referência (`lets-ui`): luminosidade alvo de
 * cada degrau e o multiplicador de saturação relativo ao degrau 5, que é onde
 * a cor base é ancorada. Gerar por curva — em vez de clarear/escurecer
 * linearmente — mantém a nova marca com o mesmo ritmo de contraste da original.
 */
const RAMPS = {
  primary: {
    light: {
      lightness: [0.96, 0.85, 0.74, 0.57, 0.5, 0.41, 0.25, 0.1],
      saturation: [1.27, 1.2, 1.19, 1.09, 1, 1.13, 1.2, 1.27],
    },
    dark: {
      lightness: [0.125, 0.19, 0.28, 0.57, 0.65, 0.74, 0.84, 0.93],
      saturation: [0.56, 0.6, 0.61, 0.97, 1, 1.03, 1.12, 1.12],
    },
  },
  secondary: {
    light: {
      lightness: [1, 0.935, 0.806, 0.465, 0.367, 0.271, 0.178, 0.086],
      saturation: [0, 1.5, 1.3, 0.9, 1, 1.2, 1.2, 1.4],
    },
    dark: {
      lightness: [0.11, 0.241, 0.32, 0.533, 0.539, 0.686, 0.818, 0.969],
      saturation: [1.17, 1.17, 1.17, 1, 1, 1.33, 1.5, 3.08],
    },
  },
};

/**
 * Gera os 8 degraus de uma família a partir de uma cor base.
 * Em `secondary` a base entra apenas como matiz: a saturação é fixada no nível
 * neutro da escala de referência para não colorir demais superfícies e textos.
 */
export function generateRamp(baseHex, family, theme) {
  const curve = RAMPS[family][theme];
  const { h, s } = hexToHsl(baseHex);
  const anchor = family === 'secondary' ? (theme === 'dark' ? 0.12 : 0.1) : s;

  return curve.lightness.map((l, index) =>
    hslToHex({
      h,
      s: Math.min(1, anchor * curve.saturation[index]),
      l,
    })
  );
}

/** Luminância relativa (WCAG 2.1). */
export function luminance(hex) {
  const [r, g, b] = hexToComponents(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG entre duas cores. */
export function contrastRatio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
