/**
 * The breakpoint scale and the width selector read from it. The messages are
 * checked on a synthetic scale, where the neighbours are far enough apart to
 * tell the two directions of the failure apart; the invariants are checked
 * again on the reference brand's real files, so a versioned scale that stops
 * being valid fails here.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  BREAKPOINT_ORDER,
  BREAKPOINT_PREFIX,
  breakpointBounds,
  breakpointError,
  viewportEntries,
  viewportModel,
  viewportSelection,
  viewportWidth,
} from './breakpoints.js';
import { FOUNDATION_FIELDS } from './schema.js';
import { createDefaultState } from './state.js';

/** A foundation holding only the breakpoints, in the shape the state uses. */
const foundationOf = (widths) =>
  Object.fromEntries(
    Object.entries(widths).map(([step, value]) => [
      `${BREAKPOINT_PREFIX}${step}`,
      { value, unit: 'px' },
    ])
  );

const DEFAULTS = { '1xs': 320, sm: 640, md: 768, lg: 1024, '1xl': 1440 };
const foundation = foundationOf(DEFAULTS);

const rangeOf = (step) => {
  const item = FOUNDATION_FIELDS.find(
    (field) => field.path === `${BREAKPOINT_PREFIX}${step}`
  );
  return { min: item.min, max: item.max };
};

describe('breakpointError', () => {
  it('accepts a value strictly between its neighbours', () => {
    expect(breakpointError(foundation, 'sm', 700)).toBeNull();
    expect(breakpointError(foundation, 'md', 700)).toBeNull();
  });

  it('refuses a value equal to or below the smaller neighbour', () => {
    expect(breakpointError(foundation, 'sm', 320)).toBe(
      'Must be greater than 1xs (320px).'
    );
    expect(breakpointError(foundation, 'sm', 300)).toBe(
      'Must be greater than 1xs (320px).'
    );
  });

  it('refuses a value equal to or above the larger neighbour', () => {
    expect(breakpointError(foundation, 'sm', 768)).toBe(
      'Must be less than md (768px).'
    );
    expect(breakpointError(foundation, 'sm', 900)).toBe(
      'Must be less than md (768px).'
    );
  });

  it('leaves the ends of the scale bound on one side only', () => {
    expect(breakpointError(foundation, '1xs', 240)).toBeNull();
    expect(breakpointError(foundation, '1xs', 640)).toBe(
      'Must be less than sm (640px).'
    );
    expect(breakpointError(foundation, '1xl', 2560)).toBeNull();
    expect(breakpointError(foundation, '1xl', 1024)).toBe(
      'Must be greater than lg (1024px).'
    );
  });

  it('refuses an emptied field instead of reading it as zero', () => {
    // `Number('')` is 0, which is finite and below every larger neighbour:
    // taking the raw string is what stops a 0px breakpoint being committed.
    expect(breakpointError(foundation, '1xs', '')).toBe(
      'Enter a value in pixels.'
    );
    expect(breakpointError(foundation, '1xs', '   ')).toBe(
      'Enter a value in pixels.'
    );
    expect(breakpointError(foundation, '1xs', 'wide')).toBe(
      'Enter a value in pixels.'
    );
    expect(breakpointError(foundation, '1xs', Number.NaN)).toBe(
      'Enter a value in pixels.'
    );
  });

  it('reads a numeric string the way the field reports it', () => {
    expect(breakpointError(foundation, 'sm', '700')).toBeNull();
    expect(breakpointError(foundation, 'sm', '320')).toBe(
      'Must be greater than 1xs (320px).'
    );
  });

  it('holds every step inside the range the schema declares', () => {
    for (const step of BREAKPOINT_ORDER) {
      const { min, max } = rangeOf(step);
      const message = `Must be between ${min}px and ${max}px.`;
      expect(breakpointError(foundation, step, min - 1)).toBe(message);
      expect(breakpointError(foundation, step, max + 1)).toBe(message);
    }
  });

  it('ignores a path that is not a breakpoint', () => {
    expect(breakpointError(foundation, 'container', 0)).toBeNull();
  });
});

describe('breakpointBounds', () => {
  it('opens a window strictly between the neighbours', () => {
    expect(breakpointBounds(foundation, 'sm')).toEqual({ min: 321, max: 767 });
    expect(breakpointBounds(foundation, 'md')).toEqual({ min: 641, max: 1023 });
  });

  it('falls back to the schema range at the ends of the scale', () => {
    expect(breakpointBounds(foundation, '1xs')).toEqual({
      min: rangeOf('1xs').min,
      max: 639,
    });
    expect(breakpointBounds(foundation, '1xl')).toEqual({
      min: 1025,
      max: rangeOf('1xl').max,
    });
  });

  it('never widens past the schema range', () => {
    const wide = foundationOf({
      '1xs': 240,
      sm: 300,
      md: 400,
      lg: 500,
      '1xl': 2560,
    });

    for (const step of BREAKPOINT_ORDER) {
      const { min, max } = breakpointBounds(wide, step);
      expect(min).toBeGreaterThanOrEqual(rangeOf(step).min);
      expect(max).toBeLessThanOrEqual(rangeOf(step).max);
    }
  });

  it('agrees with the error: the whole window is accepted, and only it', () => {
    for (const step of BREAKPOINT_ORDER) {
      const { min, max } = breakpointBounds(foundation, step);
      expect(breakpointError(foundation, step, min)).toBeNull();
      expect(breakpointError(foundation, step, max)).toBeNull();
      expect(breakpointError(foundation, step, min - 1)).not.toBeNull();
      expect(breakpointError(foundation, step, max + 1)).not.toBeNull();
    }
  });
});

describe('viewport selector', () => {
  it('lists the brand own breakpoints, widest first', () => {
    expect(viewportEntries(foundation)).toEqual([
      { step: '1xl', width: 1440 },
      { step: 'lg', width: 1024 },
      { step: 'md', width: 768 },
      { step: 'sm', width: 640 },
      { step: '1xs', width: 320 },
    ]);
  });

  it('puts Fill first and labels every step with its width', () => {
    const model = viewportModel(foundation);

    expect(model.steps).toEqual(['full', '1xl', 'lg', 'md', 'sm', '1xs']);
    expect(model.labels).toEqual([
      'Fill',
      '1440 — 1xl',
      '1024 — lg',
      '768 — md',
      '640 — sm',
      '320 — 1xs',
    ]);
  });

  it('changes its signature only when a breakpoint changes', () => {
    const edited = foundationOf({ ...DEFAULTS, sm: 700 });

    expect(viewportModel(foundation).signature).toBe(
      viewportModel(foundationOf(DEFAULTS)).signature
    );
    expect(viewportModel(edited).signature).not.toBe(
      viewportModel(foundation).signature
    );
  });

  it('keeps the selection on the breakpoint after an edit', () => {
    const model = viewportModel(foundation);
    const selected = viewportSelection(model.steps, 'sm');
    expect(model.steps[selected - 1]).toBe('sm');

    // `sm` moves; the label changes but the selection is still `sm`.
    const edited = viewportModel(foundationOf({ ...DEFAULTS, sm: 700 }));
    const next = viewportSelection(edited.steps, 'sm');

    expect(edited.steps[next - 1]).toBe('sm');
    expect(edited.labels[next - 1]).toBe('700 — sm');
  });

  it('falls back to Fill when the previous step is gone or unset', () => {
    const { steps } = viewportModel(foundation);

    expect(viewportSelection(steps, 'full')).toBe(1);
    expect(viewportSelection(steps, undefined)).toBe(1);
    expect(viewportSelection(steps, '3xl')).toBe(1);
  });

  it('simulates the width the edited breakpoint now holds', () => {
    expect(viewportWidth(foundation, 'sm')).toBe(640);
    expect(viewportWidth(foundationOf({ ...DEFAULTS, sm: 700 }), 'sm')).toBe(
      700
    );
  });

  it('simulates no width at all for Fill', () => {
    expect(viewportWidth(foundation, 'full')).toBeNull();
    expect(viewportWidth(foundation, undefined)).toBeNull();
  });
});

describe('the reference brand', () => {
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

  const reference = createDefaultState(
    {
      foundation: brandFile('foundation.json'),
      light: brandFile('colors.light.json'),
      dark: brandFile('colors.dark.json'),
    },
    { name: "Let's UI", slug: 'lets-ui' }
  ).foundation;

  it('holds a scale the editor would accept as it stands', () => {
    for (const step of BREAKPOINT_ORDER) {
      const current = reference[`${BREAKPOINT_PREFIX}${step}`].value;
      const { min, max } = breakpointBounds(reference, step);

      expect(breakpointError(reference, step, current)).toBeNull();
      expect(current).toBeGreaterThanOrEqual(min);
      expect(current).toBeLessThanOrEqual(max);
    }
  });

  it('is strictly ascending, as the media queries require', () => {
    const widths = BREAKPOINT_ORDER.map(
      (step) => reference[`${BREAKPOINT_PREFIX}${step}`].value
    );

    for (let index = 1; index < widths.length; index += 1) {
      expect(widths[index]).toBeGreaterThan(widths[index - 1]);
    }
  });

  it('feeds the selector its own widths, widest first', () => {
    const model = viewportModel(reference);

    expect(model.steps).toEqual(['full', ...[...BREAKPOINT_ORDER].reverse()]);
    for (const step of BREAKPOINT_ORDER) {
      expect(viewportWidth(reference, step)).toBe(
        reference[`${BREAKPOINT_PREFIX}${step}`].value
      );
    }
  });
});
