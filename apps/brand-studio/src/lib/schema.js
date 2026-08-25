/**
 * Descrição declarativa de tudo que uma marca pode customizar.
 *
 * A fonte da verdade continua sendo os arquivos DTCG da marca; este arquivo só
 * diz **como** cada token é editado (controle, rótulo, unidade, opções) e em
 * que seção da barra lateral ele aparece.
 */

import { isAlias, aliasToVar, cssVarName } from './dtcg.js';

export const FAMILIES = ['primary', 'secondary'];
export const STEPS = [1, 2, 3, 4, 5, 6, 7, 8];
export const THEMES = ['light', 'dark'];

/** Pesos disponíveis nos tokens globais — o token da marca é um alias para um deles. */
export const WEIGHT_OPTIONS = [
  { label: 'Light (300)', value: '{lui.typography.weight.light}' },
  { label: 'Regular (400)', value: '{lui.typography.weight.regular}' },
  { label: 'Medium (500)', value: '{lui.typography.weight.medium}' },
  { label: 'Semibold (600)', value: '{lui.typography.weight.semibold}' },
  { label: 'Bold (700)', value: '{lui.typography.weight.bold}' },
];

/** Espaçamentos fixos globais — margens e gutters do grid são aliases para eles. */
export const SPACING_OPTIONS = [0, 8, 16, 24, 32, 40].map((n) => ({
  label: `${n}px`,
  value: `{lui.spacing.fixed.${n}}`,
}));

/** Pilhas de fonte prontas, para quem não quer digitar a lista inteira. */
export const FONT_STACKS = [
  {
    label: 'Sistema (padrão)',
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
    label: 'Geométrica',
    value: ['Futura', 'Avenir Next', 'Avenir', 'sans-serif'],
  },
  {
    label: 'Grotesca',
    value: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  },
  {
    label: 'Serifada',
    value: ['Iowan Old Style', 'Georgia', 'Times New Roman', 'serif'],
  },
  {
    label: 'Monoespaçada',
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
 * Seções da barra lateral. `path` é relativo à raiz `lui.brand`, que é o
 * recorte exato que uma marca controla.
 */
export const SECTIONS = [
  {
    id: 'typography',
    label: 'Tipografia',
    groups: [
      {
        label: 'Famílias',
        fields: [
          field('typography.font-family.heading', 'Títulos', 'font-family'),
          field('typography.font-family.body', 'Corpo', 'font-family'),
        ],
      },
      {
        label: 'Escala fluida',
        hint: 'Mínimo e máximo em rem. O valor intermediário é recalculado como clamp().',
        fields: FONT_SIZE_STEPS.map((step) =>
          field(`typography.font-size.${step}`, step, 'clamp')
        ),
      },
      {
        label: 'Entrelinha',
        fields: [
          field('typography.line-height.heading', 'Títulos', 'number', {
            step: 0.05,
            min: 1,
            max: 2,
          }),
          field('typography.line-height.body', 'Corpo', 'number', {
            step: 0.05,
            min: 1,
            max: 2,
          }),
        ],
      },
      {
        label: 'Pesos por variante',
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
    label: 'Bordas',
    groups: [
      {
        label: 'Raio',
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
        hint: 'Compilados como literais no build (media queries não aceitam var()), então o preview não reage em tempo real.',
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
        label: 'Colunas',
        hint: 'Também resolvidas no build — o preview simula o breakpoint ativo por JavaScript.',
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
        label: 'Margens',
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
    label: 'Efeitos',
    groups: [
      {
        label: 'Opacidade',
        fields: [
          field('opacity.disabled', 'Desabilitado', 'number', {
            min: 0,
            max: 1,
            step: 0.05,
          }),
        ],
      },
    ],
  },
];

/** Todos os campos de fundação em uma lista plana. */
export const FOUNDATION_FIELDS = SECTIONS.flatMap((section) =>
  section.groups.flatMap((group) => group.fields)
);

/** Converte um `$value` DTCG no valor CSS equivalente ao emitido pelo build. */
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

/** Nome da custom property de um caminho relativo a `lui.brand`. */
export function brandVar(relativePath) {
  return cssVarName(`lui.brand.${relativePath}`);
}
