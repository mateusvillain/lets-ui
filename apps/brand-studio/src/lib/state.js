/**
 * Estado da marca em edição.
 *
 * Os valores são guardados exatamente no formato DTCG dos arquivos de origem —
 * assim o export é uma substituição direta e nenhuma informação se perde no
 * caminho entre o arquivo, a interface e o preview.
 */

import { flatten, applyValues } from './dtcg.js';
import { toCssValue, brandVar, THEMES } from './schema.js';

const STORAGE_KEY = 'lets-ui:brand-studio';

/** Recorta o subconjunto `lui.brand` de um arquivo de tokens. */
function brandRoot(tree) {
  return tree?.lui?.brand ?? {};
}

/** Estado inicial a partir dos arquivos da marca de referência. */
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

/** Custom properties a aplicar no preview para um tema. */
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

/** Caminhos cujo valor difere do estado padrão — usado para marcar o que mudou. */
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

/** Arquivos DTCG prontos para gravar em `tokens/brand/<slug>/`. */
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
 * Trecho de `letsui.resolver.json` que registra a marca. Sem isso o Terrazzo
 * não conhece os arquivos exportados.
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
    /* modo privado / storage cheio: o studio segue funcionando sem persistir */
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
    /* nada a limpar */
  }
}

/** Importa arquivos DTCG enviados pelo usuário, ignorando o que não reconhece. */
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
