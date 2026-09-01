/**
 * Random brand — a whole brand drawn in one go.
 *
 * The point is not to roll each token independently: a `font-size.md` picked
 * loose between 0.5rem and 4rem does not produce a brand, it produces junk.
 * What gets rolled here are the **parameters** each scale is born from — a hue,
 * a modular ratio, a base radius, a set of column counts — and the scales are
 * then derived from them by the same rules the reference brand follows. The
 * result is always unexpected and always coherent: the type scale stays a
 * geometric progression, the breakpoints stay ascending, the gutter keeps
 * fitting inside the margin.
 *
 * Every draw is bounded by the same limits `schema.js` declares for manual
 * editing, so nothing coming out of here is a value the user could not have
 * typed themselves.
 */

import { buildClamp } from './clamp.js';
import { generateRamp, hexToTokenValue, hslToHex } from './color.js';
import { FAMILIES, FONT_STACKS, STEPS, THEMES } from './schema.js';

const random = (min, max) => min + Math.random() * (max - min);
const randomInt = (min, max) => Math.floor(random(min, max + 1));
const pick = (list) => list[randomInt(0, list.length - 1)];
const roundTo = (value, step) => Math.round(value / step) * step;

/* ── Color ───────────────────────────────────────────────────── */

/**
 * Both families come out of a single rolled hue. `secondary` gets a hue offset,
 * but its saturation curve already anchors at a near-neutral level, so it goes
 * on serving as surface and text instead of competing with the primary. Both
 * ramps come from `generateRamp` — that is, from the reference brand's own
 * lightness curves — which is what preserves the contrast rhythm between steps,
 * and with it the legibility.
 */
function randomColors() {
  const hue = random(0, 360);
  const saturation = random(0.55, 0.95);
  const base = {
    primary: hslToHex({ h: hue, s: saturation, l: 0.5 }),
    secondary: hslToHex({
      h: (hue + pick([-40, -25, 0, 25, 40, 180])) % 360,
      s: saturation,
      l: 0.5,
    }),
  };

  return Object.fromEntries(
    THEMES.map((theme) => [
      theme,
      Object.fromEntries(
        FAMILIES.flatMap((family) =>
          generateRamp(base[family], family, theme).map((hex, index) => [
            `${family}.${STEPS[index]}`,
            hexToTokenValue(hex),
          ])
        )
      ),
    ])
  );
}

/* ── Typography ───────────────────────────────────────────────── */

const FONT_SIZE_STEPS = [
  '3xs',
  '2xs',
  '1xs',
  'sm',
  'md',
  'lg',
  '1xl',
  '2xl',
  '3xl',
];

/** `1xs` is the body-copy step: the scale grows and shrinks out from it. */
const BODY_STEP = FONT_SIZE_STEPS.indexOf('1xs');

/**
 * One modular ratio per end: the minimum's is tighter than the maximum's, which
 * is what makes the scale open up as the viewport grows instead of merely
 * scaling with it. The last step gets an extra jump because `3xl` is display
 * size, not the natural continuation of the progression.
 *
 * The gap between the body's minimum and maximum is not free: because the
 * maximum grows faster than the minimum, it also **shrinks** faster going down
 * the scale, and on the steps below body it can drop under the minimum. An
 * inverted `clamp()` is a step that gets smaller as the screen gets bigger.
 * Hence the floor: the body's spread has to cover how far the two ratios
 * diverge by the smallest step.
 */
function randomFontSizes() {
  const ratioMin = random(1.1, 1.18);
  const ratioMax = ratioMin + random(0.03, 0.09);
  const bodyMin = random(0.82, 0.95);
  const minimumSpread = (ratioMax / ratioMin) ** BODY_STEP;
  const bodyMax = bodyMin * Math.max(random(1.08, 1.2), minimumSpread * 1.01);
  const displayJump = random(1.15, 1.35);

  return Object.fromEntries(
    FONT_SIZE_STEPS.map((step, index) => {
      const distance = index - BODY_STEP;
      const last = index === FONT_SIZE_STEPS.length - 1;
      const min = bodyMin * ratioMin ** distance * (last ? displayJump : 1);
      const max = bodyMax * ratioMax ** distance * (last ? displayJump : 1);

      return [
        `typography.font-size.${step}`,
        buildClamp(min, Math.max(min, max)),
      ];
    })
  );
}

const weight = (name) => `{lui.typography.weight.${name}}`;

/**
 * Weights are not rolled one by one: the hierarchy between variants is what
 * gives the brand its character, and rolling them independently dissolves it.
 * Each entry here is a coherent set — the display can be light and dramatic or
 * heavy and solid, but never lighter than the body copy it sits above.
 */
const WEIGHT_SETS = [
  { display: 'light', strong: 'semibold', soft: 'regular', mid: 'medium' },
  { display: 'bold', strong: 'bold', soft: 'regular', mid: 'semibold' },
  { display: 'semibold', strong: 'semibold', soft: 'regular', mid: 'medium' },
  { display: 'regular', strong: 'medium', soft: 'light', mid: 'regular' },
];

function randomTypography() {
  const set = pick(WEIGHT_SETS);

  // Monospace works as a heading face, not as body: in running text it costs
  // legibility without giving character back.
  const bodyStacks = FONT_STACKS.filter((stack) => !/mono/i.test(stack.label));

  return {
    'typography.font-family.heading': [...pick(FONT_STACKS).value],
    'typography.font-family.body': [...pick(bodyStacks).value],
    ...randomFontSizes(),
    'typography.line-height.heading': Number(random(1.1, 1.35).toFixed(2)),
    'typography.line-height.body': Number(random(1.4, 1.7).toFixed(2)),
    'typography.weight.display': weight(set.display),
    'typography.weight.title': weight(set.strong),
    'typography.weight.subtitle': weight(set.soft),
    'typography.weight.headline': weight(set.strong),
    'typography.weight.subheadline': weight(set.soft),
    'typography.weight.block-title': weight(set.mid),
    'typography.weight.overtitle': weight(set.strong),
  };
}

/* ── Shape ────────────────────────────────────────────────────── */

const px = (value) => ({ value, unit: 'px' });

/**
 * One rolled base radius, and the five steps derived from it by proportion.
 * Zero is a valid and desirable outcome: sharp-cornered brands exist, and this
 * is the only way for the draw to produce one.
 */
function randomRadii() {
  const md = pick([0, 2, 4, 6, 8, 10, 12, 16, 20]);
  const scale = { xs: 0.25, sm: 0.5, md: 1, lg: 1.5, xl: 2 };

  return Object.fromEntries(
    Object.entries(scale).map(([step, factor]) => [
      `border.radius.${step}`,
      px(Math.round(md * factor)),
    ])
  );
}

/* ── Grid ─────────────────────────────────────────────────────── */

const spacing = (value) => `{lui.spacing.fixed.${value}}`;

/**
 * Plausible column sets, from the largest breakpoint down to the smallest. They
 * never grow as the screen shrinks, and every one of them divides in ways a
 * layout can actually use.
 */
const COLUMN_SETS = [
  [12, 12, 8, 8, 4],
  [12, 12, 12, 6, 4],
  [16, 16, 12, 8, 4],
  [12, 12, 8, 4, 4],
  [8, 8, 8, 4, 4],
];

/**
 * Breakpoints are rolled in a cascade, each one out of the previous, because
 * the one rule that cannot be broken is the ordering: an `sm` at or below `1xs`
 * produces media queries that never match. `1xs` is always one pixel below
 * `sm` — it marks the ceiling of the smaller band, not the floor of a new one.
 */
function randomGrid() {
  const sm = roundTo(random(720, 840), 8);
  const md = roundTo(sm + random(192, 320), 8);
  const lg = roundTo(md + random(192, 320), 8);
  const xl = roundTo(lg + random(128, 224), 8);

  const [c1xl, clg, cmd, csm, c1xs] = pick(COLUMN_SETS);

  // Margins never shrink as the screen grows, and the gutter never exceeds the
  // margin at the same step — otherwise the columns breathe from each other
  // before they respect the edge, and the page loses its side air.
  const marginLg = pick([24, 32, 40]);
  const marginMd = pick([16, 24, 32].filter((v) => v <= marginLg));
  const marginSm = pick([16, 24, 32].filter((v) => v <= marginMd));
  const margin1xs = pick([8, 16].filter((v) => v <= marginSm));

  const gapLarge = pick([16, 24, 32].filter((v) => v <= marginLg));
  const gapSmall = pick(
    [8, 16, 24].filter(
      (v) => v <= Math.min(gapLarge, marginMd, marginSm, margin1xs)
    )
  );

  return {
    'grid.breakpoint.1xs': px(sm - 1),
    'grid.breakpoint.sm': px(sm),
    'grid.breakpoint.md': px(md),
    'grid.breakpoint.lg': px(lg),
    'grid.breakpoint.1xl': px(xl),

    // The container is the largest breakpoint minus the margins on both sides:
    // that is what makes the last column end where the margin begins.
    'grid.container.1xl': px(roundTo(xl - marginLg * 2, 8)),

    'grid.column.1xl': c1xl,
    'grid.column.lg': clg,
    'grid.column.md': cmd,
    'grid.column.sm': csm,
    'grid.column.1xs': c1xs,

    'grid.margin.lg': spacing(marginLg),
    'grid.margin.md': spacing(marginMd),
    'grid.margin.sm': spacing(marginSm),
    'grid.margin.1xs': spacing(margin1xs),

    'grid.gap.1xl': spacing(gapLarge),
    'grid.gap.lg': spacing(gapLarge),
    'grid.gap.md': spacing(gapSmall),
    'grid.gap.sm': spacing(gapSmall),
    'grid.gap.1xs': spacing(gapSmall),
  };
}

/* ── Brand ────────────────────────────────────────────────────── */

/**
 * A whole brand, rolled. Identity — name and identifier — stays out of the
 * draw: it belongs to the user, not to the palette.
 *
 * It starts from the default values rather than the current state so that two
 * randomizations in a row do not accumulate leftovers from one another.
 */
export function randomBrand(defaults, identity) {
  const state = structuredClone(defaults);

  state.name = identity.name;
  state.slug = identity.slug;
  state.colors = randomColors();

  Object.assign(state.foundation, {
    ...randomTypography(),
    ...randomRadii(),
    ...randomGrid(),
    'opacity.disabled': Number(roundTo(random(0.3, 0.6), 0.05).toFixed(2)),
  });

  return state;
}
