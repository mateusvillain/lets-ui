/**
 * The DTCG layer is what makes the export a substitution rather than a
 * regeneration. These tests pin the properties the PR claims for it: `$type`,
 * `description`, key order and unexposed tokens all survive a round trip.
 */

import { describe, expect, it } from 'vitest';

import {
  aliasToVar,
  applyValues,
  cssVarName,
  flatten,
  getToken,
  isAlias,
} from './dtcg.js';

const tree = () => ({
  lui: {
    brand: {
      $type: 'color',
      description: 'Brand tokens',
      color: {
        primary: {
          1: { $value: { hex: '#ffffff' }, description: 'Lightest' },
          2: { $value: { hex: '#000000' } },
        },
      },
      grid: {
        $type: 'dimension',
        breakpoint: {
          sm: { $value: { value: 768, unit: 'px' } },
        },
        // A token the interface does not expose yet.
        unexposed: {
          $value: { value: 42, unit: 'px' },
          description: 'Keep me',
        },
      },
    },
  },
});

describe('flatten', () => {
  it('returns a path -> { value, type } map', () => {
    const flat = flatten(tree().lui.brand);

    expect(flat['color.primary.1']).toEqual({
      value: { hex: '#ffffff' },
      type: 'color',
    });
    expect(flat['grid.breakpoint.sm'].type).toBe('dimension');
  });

  it('inherits `$type` from the nearest ancestor that declares it', () => {
    const flat = flatten(tree().lui.brand);
    expect(flat['color.primary.2'].type).toBe('color');
    expect(flat['grid.unexposed'].type).toBe('dimension');
  });

  it('skips `$`-prefixed keys and descriptions', () => {
    const paths = Object.keys(flatten(tree().lui.brand));
    expect(paths.some((path) => path.includes('$'))).toBe(false);
    expect(paths).not.toContain('description');
  });
});

describe('applyValues', () => {
  it('does not mutate the original tree', () => {
    const original = tree();
    applyValues(original, { 'lui.brand.color.primary.1': { hex: '#123456' } });
    expect(original.lui.brand.color.primary[1].$value).toEqual({
      hex: '#ffffff',
    });
  });

  it('preserves `$type`, `description` and key order', () => {
    const source = tree();
    const result = applyValues(source, {
      'lui.brand.color.primary.1': { hex: '#123456' },
    });

    expect(result.lui.brand.$type).toBe('color');
    expect(result.lui.brand.description).toBe('Brand tokens');
    expect(result.lui.brand.color.primary[1].description).toBe('Lightest');
    expect(Object.keys(result.lui.brand)).toEqual(
      Object.keys(source.lui.brand)
    );
    expect(result.lui.brand.color.primary[1].$value).toEqual({
      hex: '#123456',
    });
  });

  it('passes unexposed tokens through intact', () => {
    const result = applyValues(tree(), {
      'lui.brand.color.primary.1': { hex: '#123456' },
    });

    expect(result.lui.brand.grid.unexposed).toEqual({
      $value: { value: 42, unit: 'px' },
      description: 'Keep me',
    });
  });

  it('never creates a token that is not already in the tree', () => {
    const result = applyValues(tree(), { 'lui.brand.color.invented': '#fff' });
    expect(result.lui.brand.color.invented).toBeUndefined();
  });
});

describe('getToken', () => {
  it('returns undefined for a path that does not exist', () => {
    expect(getToken(tree(), 'lui.brand.nope.deeper')).toBeUndefined();
  });
});

describe('cssVarName / aliasToVar / isAlias', () => {
  it('converts a dotted path into a custom property', () => {
    expect(cssVarName('lui.brand.color.primary.1')).toBe(
      '--lui-brand-color-primary-1'
    );
  });

  it('converts a DTCG alias into a var() reference', () => {
    expect(aliasToVar('{lui.spacing.fixed.40}')).toBe(
      'var(--lui-spacing-fixed-40)'
    );
  });

  it('recognizes only brace-delimited strings as aliases', () => {
    expect(isAlias('{lui.spacing.fixed.40}')).toBe(true);
    expect(isAlias('16px')).toBe(false);
    expect(isAlias({ hex: '#fff' })).toBe(false);
  });
});
