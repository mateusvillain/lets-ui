/**
 * State of the brand being edited.
 *
 * Values are stored in exactly the DTCG format of the source files — that way
 * the export is a straight substitution and nothing is lost on the way between
 * the file, the interface and the preview.
 */

import { flatten, applyValues } from './dtcg.js';
import { toCssValue, brandVar, THEMES } from './schema.js';

const STORAGE_KEY = 'lets-ui:brand-studio';

/** Slices the `lui.brand` subset out of a token file. */
function brandRoot(tree) {
  return tree?.lui?.brand ?? {};
}

/** Initial state from the reference brand's files. */
export function createDefaultState(templates, meta) {
  return {
    name: meta.name,
    slug: meta.slug,
    foundation: mapValues(flatten(brandRoot(templates.foundation))),
    colors: Object.fromEntries(
      THEMES.map((theme) => [
        theme,
        mapValues(flatten(brandRoot(templates[theme])), 'color.'),
      ])
    ),
  };
}

function mapValues(flat, stripPrefix = '') {
  return Object.fromEntries(
    Object.entries(flat).map(([path, token]) => [
      stripPrefix && path.startsWith(stripPrefix)
        ? path.slice(stripPrefix.length)
        : path,
      token.value,
    ])
  );
}

/** Custom properties to apply to the preview for a given theme. */
export function toCssVars(state, theme) {
  const vars = {};

  for (const [path, value] of Object.entries(state.foundation)) {
    vars[brandVar(path)] = toCssValue(value);
  }

  for (const [path, value] of Object.entries(state.colors[theme])) {
    vars[brandVar(`color.${path}`)] = toCssValue(value);
  }

  return vars;
}

/** Paths whose value differs from the default state — used to flag what changed. */
export function changedPaths(state, defaults) {
  const changed = new Set();
  const differs = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

  for (const [path, value] of Object.entries(state.foundation)) {
    if (differs(value, defaults.foundation[path])) changed.add(path);
  }

  for (const theme of THEMES) {
    for (const [path, value] of Object.entries(state.colors[theme])) {
      if (differs(value, defaults.colors[theme][path]))
        changed.add(`${theme}:color.${path}`);
    }
  }

  return changed;
}

/** DTCG files ready to be written to `tokens/brand/<slug>/`. */
export function toFiles(state, templates) {
  const prefix = (values, extra = '') =>
    Object.fromEntries(
      Object.entries(values).map(([path, value]) => [
        `lui.brand.${extra}${path}`,
        value,
      ])
    );

  return {
    'foundation.json': applyValues(
      templates.foundation,
      prefix(state.foundation)
    ),
    'colors.light.json': applyValues(
      templates.light,
      prefix(state.colors.light, 'color.')
    ),
    'colors.dark.json': applyValues(
      templates.dark,
      prefix(state.colors.dark, 'color.')
    ),
  };
}

/**
 * The `letsui.resolver.json` fragment that registers the brand. Without it
 * Terrazzo does not know the exported files exist.
 */
export function resolverSnippet(slug) {
  return JSON.stringify(
    {
      brandColor: {
        contexts: {
          [`${slug}-light`]: [
            { $ref: `./tokens/brand/${slug}/colors.light.json` },
          ],
          [`${slug}-dark`]: [
            { $ref: `./tokens/brand/${slug}/colors.dark.json` },
          ],
        },
      },
      brandFoundation: {
        contexts: {
          [slug]: [{ $ref: `./tokens/brand/${slug}/foundation.json` }],
        },
      },
    },
    null,
    2
  );
}

export function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / storage full: the studio keeps working without persisting */
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clear() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Imports DTCG files supplied by the user, ignoring anything it does not recognize. */
export function fromFiles(files, fallback) {
  const next = structuredClone(fallback);

  if (files.foundation) {
    Object.assign(
      next.foundation,
      mapValues(flatten(brandRoot(files.foundation)))
    );
  }
  for (const theme of THEMES) {
    if (files[theme]) {
      Object.assign(
        next.colors[theme],
        mapValues(flatten(brandRoot(files[theme])), 'color.')
      );
    }
  }

  return next;
}
