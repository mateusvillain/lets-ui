/**
 * `slugify` decides the folder a brand is versioned under, so it is the one
 * piece of the identity field with a right answer rather than a preference.
 */

import { describe, expect, it } from 'vitest';

import { slugify } from './studio.js';

describe('slugify', () => {
  it('lowercases and hyphenates a readable name', () => {
    expect(slugify('Material Design')).toBe('material-design');
  });

  it('deletes apostrophes instead of hyphenating them', () => {
    // "Let's UI" is versioned as `lets-ui`, not `let-s-ui`.
    expect(slugify("Let's UI")).toBe('lets-ui');
    expect(slugify('Let’s UI')).toBe('lets-ui');
  });

  it('falls back to the base letter for accents', () => {
    expect(slugify('Ação & Cor')).toBe('acao-cor');
    expect(slugify('Crème Brûlée')).toBe('creme-brulee');
  });

  it('collapses runs of separators and trims the edges', () => {
    expect(slugify('  --Bold   Type--  ')).toBe('bold-type');
  });

  it('returns an empty string when nothing survives', () => {
    expect(slugify('!!!')).toBe('');
    expect(slugify('')).toBe('');
  });

  it('keeps digits, which a versioned brand name may carry', () => {
    expect(slugify('Studio 2026')).toBe('studio-2026');
  });
});
