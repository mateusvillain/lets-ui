/**
 * Breakpoint ordering.
 *
 * A pure reading of the brand's own foundation values, kept out of
 * `studio.js` so the invariant it enforces can be exercised without a DOM:
 * a breakpoint scale that is not strictly ascending compiles to media queries
 * that never match.
 */

import { BREAKPOINTS, FOUNDATION_FIELDS } from './schema.js';

/** Smallest to largest: the order the breakpoints must respect. */
export const BREAKPOINT_ORDER = BREAKPOINTS;

export const BREAKPOINT_PREFIX = 'grid.breakpoint.';

const read = (foundation, step) =>
  foundation[`${BREAKPOINT_PREFIX}${step}`].value;

/** The absolute window the schema declares for a breakpoint field. */
const schemaRange = (step) => {
  const item = FOUNDATION_FIELDS.find(
    (field) => field.path === `${BREAKPOINT_PREFIX}${step}`
  );
  return { min: item.min, max: item.max };
};

/**
 * Why a value cannot be accepted, or `null` when it can.
 *
 * `raw` is taken as the field wrote it rather than as a number: an emptied
 * number input reports `''`, which `Number` would read as a legitimate `0` and
 * commit a breakpoint of zero pixels.
 *
 * The ordering check looks only at the neighbours because the rest of the
 * scale was validated on the edits that produced it.
 */
export function breakpointError(foundation, step, raw) {
  const index = BREAKPOINT_ORDER.indexOf(step);
  if (index === -1) return null;

  const next =
    typeof raw === 'string' && raw.trim() === '' ? Number.NaN : Number(raw);
  if (!Number.isFinite(next)) return 'Enter a value in pixels.';

  const range = schemaRange(step);
  if (next < range.min || next > range.max) {
    return `Must be between ${range.min}px and ${range.max}px.`;
  }

  const smaller = BREAKPOINT_ORDER[index - 1];
  const larger = BREAKPOINT_ORDER[index + 1];

  if (smaller && next <= read(foundation, smaller)) {
    return `Must be greater than ${smaller} (${read(foundation, smaller)}px).`;
  }
  if (larger && next >= read(foundation, larger)) {
    return `Must be less than ${larger} (${read(foundation, larger)}px).`;
  }

  return null;
}

/**
 * The window a breakpoint may move in: strictly between its neighbours, and
 * never outside the range the schema declares. Handing this to the input is
 * what stops the steppers at the last valid value instead of letting them walk
 * into an ordering that cannot compile.
 */
export function breakpointBounds(foundation, step) {
  const range = schemaRange(step);
  const index = BREAKPOINT_ORDER.indexOf(step);

  const smaller = BREAKPOINT_ORDER[index - 1];
  const larger = BREAKPOINT_ORDER[index + 1];

  return {
    min: smaller
      ? Math.max(range.min, read(foundation, smaller) + 1)
      : range.min,
    max: larger ? Math.min(range.max, read(foundation, larger) - 1) : range.max,
  };
}
