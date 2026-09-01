/**
 * Invariants of the brand draw.
 *
 * `randomBrand` is the one function here a manual pass cannot cover: every run
 * takes a different path through the parameter space, so a scale that inverts
 * once every few hundred draws is invisible to a person clicking the button.
 * These run the draw many times and assert the properties the README promises
 * hold on every single one.
 */

import { describe, expect, it } from 'vitest';

import { randomBrand } from './random.js';
import { parseClamp } from './clamp.js';
import { FAMILIES, STEPS, THEMES } from './schema.js';

const RUNS = 300;

const BREAKPOINTS = ['1xs', 'sm', 'md', 'lg', '1xl'];
const FONT_SIZE_STEPS = [
  '3xs',
  '2xs',
  '1xs',
  'sm',
  'md',
  'lg',
  '1xl',
  '2xl',
  '3xl',
];
/** Steps that carry both a margin and a gutter, so the two can be compared. */
const MARGIN_STEPS = ['1xs', 'sm', 'md', 'lg'];

const IDENTITY = { name: 'Reference Brand', slug: 'reference-brand' };

/** A minimal default state: the draw overwrites everything it touches. */
const defaults = () => ({
  name: IDENTITY.name,
  slug: IDENTITY.slug,
  foundation: { 'opacity.disabled': 0.5 },
  colors: Object.fromEntries(THEMES.map((theme) => [theme, {}])),
});

/** `{lui.spacing.fixed.24}` -> 24 */
const spacingValue = (alias) => Number(alias.match(/\.(\d+)\}$/)[1]);

const draws = Array.from({ length: RUNS }, () =>
  randomBrand(defaults(), IDENTITY)
);

describe('randomBrand', () => {
  it('leaves the identity out of the draw', () => {
    for (const brand of draws) {
      expect(brand.name).toBe(IDENTITY.name);
      expect(brand.slug).toBe(IDENTITY.slug);
    }
  });

  it('does not accumulate leftovers between draws', () => {
    // The draw starts from the defaults, so a key absent from the defaults and
    // never written by the draw must not appear.
    const base = defaults();
    base.foundation['never.rolled'] = 'sentinel';

    const first = randomBrand(base, IDENTITY);
    const second = randomBrand(base, IDENTITY);

    expect(first.foundation['never.rolled']).toBe('sentinel');
    expect(second.foundation['never.rolled']).toBe('sentinel');
    expect(base.foundation['grid.breakpoint.sm']).toBeUndefined();
  });

  it('draws strictly ascending breakpoints', () => {
    for (const brand of draws) {
      const widths = BREAKPOINTS.map(
        (step) => brand.foundation[`grid.breakpoint.${step}`].value
      );

      for (let i = 1; i < widths.length; i += 1) {
        expect(widths[i]).toBeGreaterThan(widths[i - 1]);
      }
    }
  });

  it('keeps `1xs` exactly one pixel below `sm`', () => {
    // `1xs` is the ceiling of the mobile band, not the floor of a new one.
    for (const brand of draws) {
      const base = brand.foundation['grid.breakpoint.1xs'].value;
      const sm = brand.foundation['grid.breakpoint.sm'].value;
      expect(sm - base).toBe(1);
    }
  });

  it('never lets the column count grow as the screen shrinks', () => {
    for (const brand of draws) {
      const columns = BREAKPOINTS.map(
        (step) => brand.foundation[`grid.column.${step}`]
      );

      for (let i = 1; i < columns.length; i += 1) {
        expect(columns[i]).toBeGreaterThanOrEqual(columns[i - 1]);
      }
    }
  });

  it('keeps the gutter within the margin at every step', () => {
    for (const brand of draws) {
      for (const step of MARGIN_STEPS) {
        const margin = spacingValue(brand.foundation[`grid.margin.${step}`]);
        const gap = spacingValue(brand.foundation[`grid.gap.${step}`]);
        expect(gap).toBeLessThanOrEqual(margin);
      }
    }
  });

  it('never shrinks the margin as the screen grows', () => {
    for (const brand of draws) {
      const margins = MARGIN_STEPS.map((step) =>
        spacingValue(brand.foundation[`grid.margin.${step}`])
      );

      for (let i = 1; i < margins.length; i += 1) {
        expect(margins[i]).toBeGreaterThanOrEqual(margins[i - 1]);
      }
    }
  });

  it('ends the container where the margin begins', () => {
    for (const brand of draws) {
      const xl = brand.foundation['grid.breakpoint.1xl'].value;
      const container = brand.foundation['grid.container.1xl'].value;
      expect(container).toBeLessThan(xl);
    }
  });

  it('draws a geometric, non-inverted type scale', () => {
    for (const brand of draws) {
      const scale = FONT_SIZE_STEPS.map((step) => {
        const parsed = parseClamp(
          brand.foundation[`typography.font-size.${step}`]
        );
        expect(parsed).not.toBeNull();
        return parsed;
      });

      for (const { min, max } of scale) {
        // An inverted clamp is a step that shrinks as the screen grows.
        expect(max).toBeGreaterThanOrEqual(min);
        expect(min).toBeGreaterThan(0);
      }

      // Monotonic in both ends: every step is larger than the one below it.
      for (let i = 1; i < scale.length; i += 1) {
        expect(scale[i].min).toBeGreaterThan(scale[i - 1].min);
        expect(scale[i].max).toBeGreaterThan(scale[i - 1].max);
      }
    }
  });

  it('draws weights as a curated set, not one roll per token', () => {
    // The hierarchy between variants is what gives the brand its character, so
    // the weights come from whole sets. Rolling them independently would break
    // the roles that share a weight by construction.
    const weight = (brand, role) =>
      brand.foundation[`typography.weight.${role}`];

    for (const brand of draws) {
      expect(weight(brand, 'headline')).toBe(weight(brand, 'title'));
      expect(weight(brand, 'overtitle')).toBe(weight(brand, 'title'));
      expect(weight(brand, 'subheadline')).toBe(weight(brand, 'subtitle'));

      for (const role of [
        'display',
        'title',
        'subtitle',
        'headline',
        'subheadline',
        'block-title',
        'overtitle',
      ]) {
        expect(weight(brand, role)).toMatch(
          /^\{lui\.typography\.weight\.(light|regular|medium|semibold|bold)\}$/
        );
      }
    }
  });

  it('draws a full color ramp for both families and themes', () => {
    for (const brand of draws) {
      for (const theme of THEMES) {
        for (const family of FAMILIES) {
          for (const step of STEPS) {
            const token = brand.colors[theme][`${family}.${step}`];
            expect(token.hex).toMatch(/^#[0-9a-f]{6}$/i);
          }
        }
      }
    }
  });

  it('rounds the disabled opacity into the range the schema allows', () => {
    for (const brand of draws) {
      const opacity = brand.foundation['opacity.disabled'];
      expect(opacity).toBeGreaterThanOrEqual(0.3);
      expect(opacity).toBeLessThanOrEqual(0.6);
    }
  });
});
