// Loads the custom element definitions in the browser only. Under Node (the
// connector's discovery pass) the dynamic import is never awaited, so the Lit
// bundle is not evaluated. See `runtime.ts`.
if (typeof window !== 'undefined') {
  void import('./runtime');
}

/**
 * Maps the generic props a preview receives onto attributes a custom element
 * can read.
 *
 * React does not know these tags, so it serialises every prop as an
 * attribute — `false` would land as `disabled="false"`, and Lit reads any
 * present attribute of a `type: Boolean` property as `true`. Dropping the
 * falsy ones and passing `true` as an empty string keeps booleans honest.
 */
export function elementProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(props)) {
    if (value === false || value === undefined || value === null) continue;
    attributes[name] = value === true ? '' : value;
  }

  return attributes;
}
