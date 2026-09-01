/**
 * Reading and writing the token files in the DTCG format used by Let's UI.
 *
 * The studio never rebuilds a file from scratch: it clones the brand's original
 * file and replaces only the `$value`s. That way `$type`, `description`, key
 * order and any token the interface does not expose yet survive the export
 * intact.
 */

/** Walks the DTCG tree and returns a `path -> { value, type }` map. */
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

/** Reads the `$value` at a dotted path inside the DTCG tree. */
export function getToken(tree, path) {
  return path.split('.').reduce((node, key) => node?.[key], tree);
}

/**
 * Clones the tree and applies the values from a `path -> value` map.
 * Paths missing from the tree are ignored — we never create new tokens.
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
 * DTCG alias (`{lui.spacing.fixed.40}`) -> `var(--lui-spacing-fixed-40)`.
 *
 * Font weights are the only exception: Terrazzo also emits
 * `lui.typography.weight.*` as `--lui-typography-weight-*`, which is the name
 * the compiled CSS references — we keep that name to match the build.
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
