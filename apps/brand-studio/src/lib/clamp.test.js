/**
 * The fluid type scale. The interface only ever exposes a minimum and a
 * maximum, so `buildClamp` and `parseClamp` have to be exact inverses — a drift
 * here silently rewrites the scale every time a field is read back.
 */

import { describe, expect, it } from 'vitest';

import { DEFAULT_VIEWPORT, buildClamp, parseClamp } from './clamp.js';

describe('buildClamp', () => {
  it('interpolates between the two ends across the viewport range', () => {
    const value = buildClamp(1, 2);
    expect(value).toMatch(/^clamp\(1rem, -?[\d.]+rem \+ [\d.]+vw, 2rem\)$/);
  });

  it('produces a flat scale when both ends are equal', () => {
    expect(buildClamp(1, 1)).toBe('clamp(1rem, 1rem + 0vw, 1rem)');
  });

  /**
   * Evaluates the preferred term in px at a given viewport width. The
   * intercept is in rem and the slope in vw, so both have to be resolved
   * against the root font size and the viewport before they can be compared.
   */
  const preferredPx = (value, viewportPx, rootFontSize = 16) => {
    const [, intercept, slope] = value.match(
      /clamp\([\d.]+rem, (-?[\d.]+)rem \+ (-?[\d.]+)vw/
    );
    return (
      Number(intercept) * rootFontSize + (Number(slope) / 100) * viewportPx
    );
  };

  it('resolves to the minimum at the low end of the viewport', () => {
    expect(preferredPx(buildClamp(1, 2), DEFAULT_VIEWPORT.min)).toBeCloseTo(
      16,
      2
    );
  });

  it('resolves to the maximum at the high end of the viewport', () => {
    expect(preferredPx(buildClamp(1, 2), DEFAULT_VIEWPORT.max)).toBeCloseTo(
      32,
      2
    );
  });

  it('grows monotonically across the viewport range', () => {
    const value = buildClamp(0.875, 1.5);
    const widths = [320, 600, 900, 1200, 1440];
    const sizes = widths.map((width) => preferredPx(value, width));

    for (let i = 1; i < sizes.length; i += 1) {
      expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
    }
  });
});

describe('parseClamp', () => {
  it('is the exact inverse of buildClamp', () => {
    for (const [min, max] of [
      [0.75, 1],
      [1, 1.5],
      [2.5, 4.25],
      [0.8125, 0.9375],
    ]) {
      expect(parseClamp(buildClamp(min, max))).toEqual({ min, max });
    }
  });

  it('returns null for a value that is not a fluid scale', () => {
    expect(parseClamp('1rem')).toBeNull();
    expect(parseClamp('clamp(1rem, 2vw, 2rem)')).toBeNull();
    expect(parseClamp(undefined)).toBeNull();
  });

  it('reads a negative intercept, which any growing scale produces', () => {
    expect(parseClamp('clamp(1rem, -0.25rem + 2vw, 2rem)')).toEqual({
      min: 1,
      max: 2,
    });
  });
});
