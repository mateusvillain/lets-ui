/**
 * State layer, exercised against the reference brand's real token files rather
 * than a fixture — that is what makes the export round trip meaningful: if the
 * versioned files gain a token shape the studio cannot carry, this fails.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it } from 'vitest';

import {
  changedPaths,
  clear,
  createDefaultState,
  fromFiles,
  load,
  resolverSnippet,
  save,
  toCssVars,
  toFiles,
} from './state.js';
import { THEMES } from './schema.js';

const brandFile = (name) =>
  JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL(
          `../../../../packages/lets-ui-tokens/tokens/brand/lets-ui/${name}`,
          import.meta.url
        )
      ),
      'utf8'
    )
  );

const templates = {
  foundation: brandFile('foundation.json'),
  light: brandFile('colors.light.json'),
  dark: brandFile('colors.dark.json'),
};

const meta = { name: "Let's UI", slug: 'lets-ui' };

const defaults = () => createDefaultState(templates, meta);

describe('createDefaultState', () => {
  it('reads the reference brand out of its own files', () => {
    const state = defaults();

    expect(state.name).toBe(meta.name);
    expect(state.slug).toBe(meta.slug);
    expect(Object.keys(state.foundation).length).toBeGreaterThan(0);

    for (const theme of THEMES) {
      expect(Object.keys(state.colors[theme]).length).toBeGreaterThan(0);
    }
  });

  it('strips the `color.` prefix from the color themes', () => {
    const state = defaults();
    for (const path of Object.keys(state.colors.light)) {
      expect(path.startsWith('color.')).toBe(false);
    }
  });

  it('exposes the grid tokens the studio edits', () => {
    const { foundation } = defaults();
    for (const step of ['1xs', 'sm', 'md', 'lg', '1xl']) {
      expect(foundation[`grid.breakpoint.${step}`]).toBeDefined();
      expect(foundation[`grid.column.${step}`]).toBeDefined();
    }
  });
});

describe('toFiles', () => {
  it('reproduces the source files byte for byte when nothing changed', () => {
    // The strongest form of "the export is a substitution": an untouched brand
    // exported back has to be the file it came from.
    const files = toFiles(defaults(), templates);

    expect(files['foundation.json']).toEqual(templates.foundation);
    expect(files['colors.light.json']).toEqual(templates.light);
    expect(files['colors.dark.json']).toEqual(templates.dark);
  });

  it('preserves key order in the exported file', () => {
    const files = toFiles(defaults(), templates);
    expect(JSON.stringify(files['foundation.json'])).toBe(
      JSON.stringify(templates.foundation)
    );
  });

  it('writes an edited value through to the right token', () => {
    const state = defaults();
    state.foundation['grid.column.md'] = 10;

    const files = toFiles(state, templates);

    expect(files['foundation.json'].lui.brand.grid.column.md.$value).toBe(10);
    // And nothing else moved.
    expect(files['colors.light.json']).toEqual(templates.light);
  });
});

describe('export / import round trip', () => {
  it('survives a full round trip through the DTCG files', () => {
    const state = defaults();
    state.foundation['grid.column.md'] = 10;
    state.colors.light['primary.1'] = { hex: '#123456' };

    const exported = toFiles(state, templates);
    const reimported = fromFiles(
      {
        foundation: exported['foundation.json'],
        light: exported['colors.light.json'],
        dark: exported['colors.dark.json'],
      },
      defaults()
    );

    expect(reimported.foundation).toEqual(state.foundation);
    expect(reimported.colors).toEqual(state.colors);
  });

  it('ignores files it does not recognize, keeping the fallback', () => {
    const fallback = defaults();
    const result = fromFiles({ foundation: { nothing: 'here' } }, fallback);
    expect(result.foundation).toEqual(fallback.foundation);
  });

  it('does not mutate the fallback state', () => {
    const fallback = defaults();
    const before = structuredClone(fallback);
    fromFiles({ foundation: templates.foundation }, fallback);
    expect(fallback).toEqual(before);
  });
});

describe('toCssVars', () => {
  it('emits every foundation and color token as a `--lui-brand-*` property', () => {
    const state = defaults();
    const vars = toCssVars(state, 'light');

    for (const name of Object.keys(vars)) {
      expect(name.startsWith('--lui-brand-')).toBe(true);
    }
    expect(Object.keys(vars).length).toBe(
      Object.keys(state.foundation).length +
        Object.keys(state.colors.light).length
    );
  });

  it('resolves a dimension token to the value the build would emit', () => {
    const state = defaults();
    state.foundation['grid.breakpoint.sm'] = { value: 768, unit: 'px' };
    expect(toCssVars(state, 'light')['--lui-brand-grid-breakpoint-sm']).toBe(
      '768px'
    );
  });

  it('resolves an alias to a var() reference instead of a literal', () => {
    const state = defaults();
    state.foundation['grid.gap.md'] = '{lui.spacing.fixed.24}';
    expect(toCssVars(state, 'light')['--lui-brand-grid-gap-md']).toBe(
      'var(--lui-spacing-fixed-24)'
    );
  });

  it('quotes font families that contain spaces', () => {
    const state = defaults();
    state.foundation['typography.font-family.body'] = ['Inter Tight', 'serif'];
    expect(
      toCssVars(state, 'light')['--lui-brand-typography-font-family-body']
    ).toBe('"Inter Tight", serif');
  });

  it('switches the color values with the theme', () => {
    const state = defaults();
    state.colors.light['primary.1'] = { hex: '#111111' };
    state.colors.dark['primary.1'] = { hex: '#eeeeee' };

    expect(toCssVars(state, 'light')['--lui-brand-color-primary-1']).toBe(
      '#111111'
    );
    expect(toCssVars(state, 'dark')['--lui-brand-color-primary-1']).toBe(
      '#eeeeee'
    );
  });
});

describe('changedPaths', () => {
  it('is empty for an untouched brand', () => {
    expect(changedPaths(defaults(), defaults()).size).toBe(0);
  });

  it('counts a foundation edit', () => {
    const state = defaults();
    state.foundation['grid.column.md'] = 10;

    const changed = changedPaths(state, defaults());
    expect(changed.size).toBe(1);
    expect(changed.has('grid.column.md')).toBe(true);
  });

  it('scopes a color edit to its theme', () => {
    const state = defaults();
    state.colors.dark['primary.1'] = { hex: '#123456' };

    const changed = changedPaths(state, defaults());
    expect([...changed]).toEqual(['dark:color.primary.1']);
  });

  it('compares by value, not by reference', () => {
    const state = defaults();
    const base = defaults();
    // Same content, different object identity.
    state.colors.light['primary.1'] = { ...base.colors.light['primary.1'] };
    expect(changedPaths(state, base).size).toBe(0);
  });
});

describe('persistence', () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    };
  });

  it('round trips the state through storage', () => {
    const state = defaults();
    state.foundation['grid.column.md'] = 10;

    save(state);
    expect(load()).toEqual(state);
  });

  it('returns null when nothing was saved', () => {
    expect(load()).toBeNull();
  });

  it('clears what was saved', () => {
    save(defaults());
    clear();
    expect(load()).toBeNull();
  });

  it('keeps working when storage throws', () => {
    // Private mode: the studio must not break, it just stops persisting.
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };

    expect(() => save(defaults())).not.toThrow();
    expect(() => clear()).not.toThrow();
    expect(load()).toBeNull();
  });

  it('returns null on corrupted storage', () => {
    globalThis.localStorage.setItem('lets-ui:brand-studio', '{not json');
    expect(load()).toBeNull();
  });
});

describe('resolverSnippet', () => {
  it('registers both color contexts and the foundation under the slug', () => {
    const snippet = JSON.parse(resolverSnippet('material-design'));

    expect(snippet.brandColor.contexts['material-design-light'][0].$ref).toBe(
      './tokens/brand/material-design/colors.light.json'
    );
    expect(snippet.brandColor.contexts['material-design-dark'][0].$ref).toBe(
      './tokens/brand/material-design/colors.dark.json'
    );
    expect(snippet.brandFoundation.contexts['material-design'][0].$ref).toBe(
      './tokens/brand/material-design/foundation.json'
    );
  });
});
