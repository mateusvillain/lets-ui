import { describe, expect, it } from 'vitest';

import {
  contrast,
  computeStates,
  cssColorToHex,
  fromSearch,
  mix,
  normalizeHex,
  toSearch,
} from './state.js';

describe('normalizeHex', () => {
  it('expands short hex and lowercases', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
    expect(normalizeHex('EEECF1')).toBe('#eeecf1');
  });

  it('rejects anything that is not hex', () => {
    expect(normalizeHex('red')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
  });
});

describe('cssColorToHex', () => {
  it('reads the formats getComputedStyle returns', () => {
    expect(cssColorToHex('rgb(212, 51, 50)')).toBe('#d43332');
    expect(cssColorToHex('rgba(212, 51, 50, 1)')).toBe('#d43332');
    expect(cssColorToHex('color(srgb 1 1 1)')).toBe('#ffffff');
    expect(cssColorToHex('rgb(100% 0% 0%)')).toBe('#ff0000');
  });
});

describe('mix', () => {
  it('matches what Chromium resolves for the field border', () => {
    // Measured from the compiled CSS: 40% of text(body) into the subtle border.
    expect(mix('#282b33', '#eeecf1', 40)).toBe('#9f9fa5');
    expect(mix('#c8ced9', '#353946', 40)).toBe('#707581');
  });

  it('returns the base at 0% and the tint at 100%', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#ffffff');
    expect(mix('#000000', '#ffffff', 100)).toBe('#000000');
  });
});

describe('contrast', () => {
  it('is 21:1 for black on white, symmetric', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21);
  });
});

describe('computeStates', () => {
  it('uses the background amounts and measures against the tint', () => {
    const [rest, hover, pressed] = computeStates({
      mode: 'background',
      base: '#ffffff',
      tint: '#000000',
      surface: '#ffffff',
    });
    expect(rest).toMatchObject({ name: 'rest', amount: 0, color: '#ffffff' });
    expect(hover).toMatchObject({
      amount: 8,
      color: mix('#000000', '#ffffff', 8),
    });
    expect(pressed.amount).toBe(16);
    expect(rest.contrast).toBeCloseTo(21);
  });

  it('uses the border amounts and measures against the surface', () => {
    const [rest, hover, pressed] = computeStates({
      mode: 'border',
      base: '#eeecf1',
      tint: '#282b33',
      surface: '#ffffff',
    });
    expect(hover).toMatchObject({ amount: 40, color: '#9f9fa5' });
    expect(pressed.amount).toBe(56);
    expect(rest.contrast).toBeCloseTo(contrast('#eeecf1', '#ffffff'));
  });

  it('measures a filled label against its own colour, not the tint', () => {
    // A primary button: white label, tinted with the dark opposite.
    const [rest, hover, pressed] = computeStates({
      mode: 'background',
      base: '#0a7ac8',
      content: '#ffffff',
      tint: '#131519',
      surface: '#ffffff',
    });
    expect(hover.color).toBe(mix('#131519', '#0a7ac8', 8));
    expect(hover.contrast).toBeCloseTo(contrast(hover.color, '#ffffff'));
    expect(hover.contrast).toBeGreaterThan(rest.contrast);
    expect(pressed.contrast).toBeGreaterThan(hover.contrast);
  });

  it('throws on an unknown mode', () => {
    expect(() =>
      computeStates({ mode: 'outline', base: '#fff', tint: '#000' })
    ).toThrow();
  });
});

describe('toSearch / fromSearch', () => {
  const custom = {
    theme: 'dark',
    preset: 'custom',
    mode: 'border',
    base: '#eeecf1',
    content: '#ffffff',
    tint: '#282b33',
    surface: '#ffffff',
  };

  it('round-trips custom colours', () => {
    expect(fromSearch(toSearch(custom))).toEqual({
      theme: 'dark',
      mode: 'border',
      base: '#eeecf1',
      content: '#ffffff',
      tint: '#282b33',
      surface: '#ffffff',
    });
  });

  it('stores a preset by name only', () => {
    const search = toSearch({ ...custom, preset: 'field' });
    expect(search).toBe('?theme=dark&preset=field');
    expect(fromSearch(search)).toEqual({ theme: 'dark', preset: 'field' });
  });

  it('drops values that do not validate', () => {
    expect(fromSearch('?theme=sepia&mode=outline&base=nope&tint=fff')).toEqual({
      tint: '#ffffff',
    });
  });
});
