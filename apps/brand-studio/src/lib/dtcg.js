/**
 * Leitura e escrita dos arquivos de token no formato DTCG usado pelo Let's UI.
 *
 * O studio nunca reconstrói um arquivo do zero: ele clona o arquivo original da
 * marca e substitui apenas os `$value`. Assim `$type`, `description`, ordem das
 * chaves e qualquer token que a interface ainda não exponha sobrevivem ao
 * export intactos.
 */

/** Percorre a árvore DTCG e devolve um mapa `caminho -> { value, type }`. */
export function flatten(node, prefix = '', inheritedType = null, out = {}) {
  const type = node.$type ?? inheritedType;

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$') || key === 'description') continue;
    if (!child || typeof child !== 'object') continue;

    const path = prefix ? `${prefix}.${key}` : key;

    if (child.$value !== undefined) {
      out[path] = { value: child.$value, type: child.$type ?? type };
    } else {
      flatten(child, path, type, out);
    }
  }

  return out;
}

/** Lê o `$value` de um caminho pontuado dentro da árvore DTCG. */
export function getToken(tree, path) {
  return path.split('.').reduce((node, key) => node?.[key], tree);
}

/**
 * Clona a árvore e aplica os valores do mapa `caminho -> value`.
 * Caminhos ausentes na árvore são ignorados — nunca criamos tokens novos.
 */
export function applyValues(tree, values) {
  const clone = structuredClone(tree);

  for (const [path, value] of Object.entries(values)) {
    const node = getToken(clone, path);
    if (node && node.$value !== undefined) node.$value = value;
  }

  return clone;
}

/** `lui.brand.color.primary.1` -> `--lui-brand-color-primary-1` */
export function cssVarName(path) {
  return `--${path.replace(/\./g, '-')}`;
}

/**
 * Alias DTCG (`{lui.spacing.fixed.40}`) -> `var(--lui-spacing-fixed-40)`.
 *
 * Os pesos de fonte são a única exceção: o Terrazzo emite `lui.typography.weight.*`
 * também como `--lui-typography-weight-*`, que é o nome referenciado pelo CSS
 * compilado — mantemos esse nome para bater com o build.
 */
export function aliasToVar(alias) {
  const path = alias.slice(1, -1);
  return `var(${cssVarName(path)})`;
}

export function isAlias(value) {
  return (
    typeof value === 'string' && value.startsWith('{') && value.endsWith('}')
  );
}
