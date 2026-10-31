// WCAG 2 contrast for computed colours, for tests that run in the browser.
// Computed styles can come back in any colour space (`oklch()` from the
// tokens, `color(srgb …)` out of `color-mix()`), so each colour is painted on a
// one-pixel canvas and read back as sRGB. The canvas clips to the sRGB gamut,
// which is what the screen shows on an sRGB display.
const context = document
  .createElement('canvas')
  .getContext('2d', { willReadFrequently: true });

function srgb(color) {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b].map((c) => c / 255);
}

export function luminance(color) {
  const [r, g, b] = srgb(color).map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
