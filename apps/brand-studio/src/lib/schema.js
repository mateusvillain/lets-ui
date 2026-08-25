/**
 * Declarative description of everything a brand can customize.
 *
 * The source of truth is still the brand's DTCG files; this file only says
 * **how** each token is edited (control, label, unit, options) and which
 * section of the sidebar it appears in.
 */

import { isAlias, aliasToVar, cssVarName } from './dtcg.js';

export const FAMILIES = ['primary', 'secondary'];
export const STEPS = [1, 2, 3, 4, 5, 6, 7, 8];
export const THEMES = ['light', 'dark'];

/** Weights available in the global tokens — the brand token aliases one of them. */
export const WEIGHT_OPTIONS = [
  { label: 'Light (300)', value: '{lui.typography.weight.light}' },
  { label: 'Regular (400)', value: '{lui.typography.weight.regular}' },
  { label: 'Medium (500)', value: '{lui.typography.weight.medium}' },
  { label: 'Semibold (600)', value: '{lui.typography.weight.semibold}' },
  { label: 'Bold (700)', value: '{lui.typography.weight.bold}' },
];

/** Global fixed spacing — grid margins and gutters alias these. */
export const SPACING_OPTIONS = [0, 8, 16, 24, 32, 40].map((n) => ({
  label: `${n}px`,
  value: `{lui.spacing.fixed.${n}}`,
}));

/** Ready-made font stacks, for when you would rather not type the whole list. */
export const FONT_STACKS = [
  {
    label: 'System (default)',
    value: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
    ],
  },
  {
    label: 'Geometric',
    value: ['Futura', 'Avenir Next', 'Avenir', 'sans-serif'],
  },
  {
    label: 'Grotesque',
    value: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  },
  {
    label: 'Serif',
    value: ['Iowan Old Style', 'Georgia', 'Times New Roman', 'serif'],
  },
  {
    label: 'Monospace',
    value: ['SF Mono', 'Menlo', 'Consolas', 'monospace'],
  },
];

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
const RADIUS_STEPS = ['xs', 'sm', 'md', 'lg', 'xl'];
const BREAKPOINTS = ['1xs', 'sm', 'md', 'lg', '1xl'];

const field = (path, label, control, extra = {}) => ({
  path,
  label,
  control,
  ...extra,
});

/**
 * Sidebar sections. `path` is relative to the `lui.brand` root, which is
 * exactly the slice a brand controls.
 */
export const SECTIONS = [
  {
    id: 'typography',
    label: 'Typography',
    groups: [
      {
        label: 'Families',
        fields: [
          field('typography.font-family.heading', 'Headings', 'font-family'),
          field('typography.font-family.body', 'Body', 'font-family'),
        ],
      },
      {
        label: 'Fluid scale',
        hint: 'Minimum and maximum in rem. The value in between is recomputed as clamp().',
        fields: FONT_SIZE_STEPS.map((step) =>
          field(`typography.font-size.${step}`, step, 'clamp')
        ),
      },
      {
        label: 'Line height',
        fields: [
          field('typography.line-height.heading', 'Headings', 'number', {
            step: 0.05,
            min: 1,
            max: 2,
          }),
          field('typography.line-height.body', 'Body', 'number', {
            step: 0.05,
            min: 1,
            max: 2,
          }),
        ],
      },
      {
        label: 'Weight per variant',
        fields: [
          field('typography.weight.display', 'Display', 'select', {
            options: WEIGHT_OPTIONS,
          }),
          field('typography.weight.title', 'Title', 'select', {
            options: WEIGHT_OPTIONS,
          }),
          field('typography.weight.subtitle', 'Subtitle', 'select', {
            options: WEIGHT_OPTIONS,
          }),
          field('typography.weight.headline', 'Headline', 'select', {
            options: WEIGHT_OPTIONS,
          }),
          field('typography.weight.subheadline', 'Subheadline', 'select', {
            options: WEIGHT_OPTIONS,
          }),
          field('typography.weight.block-title', 'Block title', 'select', {
            options: WEIGHT_OPTIONS,
          }),
          field('typography.weight.overtitle', 'Overtitle', 'select', {
            options: WEIGHT_OPTIONS,
          }),
        ],
      },
    ],
  },
  {
    id: 'border',
    label: 'Borders',
    groups: [
      {
        label: 'Radius',
        fields: RADIUS_STEPS.map((step) =>
          field(`border.radius.${step}`, step, 'dimension', {
            min: 0,
            max: 64,
            step: 1,
          })
        ),
      },
    ],
  },
  {
    id: 'grid',
    label: 'Grid',
    groups: [
      {
        label: 'Breakpoints',
        hint: 'Compiled as literals at build time (media queries cannot read var()), so the preview does not react live.',
        fields: BREAKPOINTS.map((step) =>
          field(`grid.breakpoint.${step}`, step, 'dimension', {
            min: 240,
            max: 2560,
            step: 1,
            static: true,
          })
        ),
      },
      {
        label: 'Container',
        fields: [
          field('grid.container.1xl', '1xl', 'dimension', {
            min: 320,
            max: 2560,
            step: 8,
          }),
        ],
      },
      {
        label: 'Columns',
        hint: 'Also resolved at build time — the preview simulates the active breakpoint in JavaScript.',
        fields: BREAKPOINTS.map((step) =>
          field(`grid.column.${step}`, step, 'number', {
            min: 1,
            max: 24,
            step: 1,
            integer: true,
            static: true,
          })
        ),
      },
      {
        label: 'Margins',
        fields: ['1xs', 'sm', 'md', 'lg'].map((step) =>
          field(`grid.margin.${step}`, step, 'select', {
            options: SPACING_OPTIONS,
          })
        ),
      },
      {
        label: 'Gutters',
        fields: BREAKPOINTS.map((step) =>
          field(`grid.gap.${step}`, step, 'select', {
            options: SPACING_OPTIONS,
          })
        ),
      },
    ],
  },
  {
    id: 'effects',
    label: 'Effects',
    groups: [
      {
        label: 'Opacity',
        fields: [
          field('opacity.disabled', 'Disabled', 'number', {
            min: 0,
            max: 1,
            step: 0.05,
          }),
        ],
      },
    ],
  },
];

/** Every foundation field in a single flat list. */
export const FOUNDATION_FIELDS = SECTIONS.flatMap((section) =>
  section.groups.flatMap((group) => group.fields)
);

/** Converts a DTCG `$value` into the CSS value the build would emit. */
export function toCssValue(value) {
  if (isAlias(value)) return aliasToVar(value);
  if (Array.isArray(value)) {
    return value
      .map((font) => (/[\s]/.test(font) ? `"${font}"` : font))
      .join(', ');
  }
  if (value && typeof value === 'object') {
    if (value.hex) return value.hex;
    if (value.unit !== undefined) return `${value.value}${value.unit}`;
  }
  return String(value);
}

/** Custom property name for a path relative to `lui.brand`. */
export function brandVar(relativePath) {
  return cssVarName(`lui.brand.${relativePath}`);
}
