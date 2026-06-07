import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

const BG_OPTIONS = [
  '',
  'neutral/surface',
  'neutral/container',
  'neutral/overlay',
  'primary/surface',
  'primary/container',
  'secondary/surface',
  'secondary/container',
  'caution/surface',
  'caution/container',
  'info/surface',
  'info/container',
  'danger/surface',
  'danger/container',
  'success/surface',
  'success/container',
];

const BORDER_COLOR_OPTIONS = [
  '',
  'neutral/subtle',
  'neutral/default',
  'primary/default',
  'secondary/default',
  'caution/default',
  'info/default',
  'danger/default',
  'success/default',
];

export default {
  title: 'Layout/Box',
  argTypes: {
    padding: {
      control: { type: 'select' },
      options: ['', 'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    paddingX: {
      control: { type: 'select' },
      options: ['', 'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      name: 'padding-x',
    },
    paddingY: {
      control: { type: 'select' },
      options: ['', 'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      name: 'padding-y',
    },
    background: {
      control: { type: 'select' },
      options: BG_OPTIONS,
      description: 'Semantic alias (`neutral/surface`) or raw CSS value.',
    },
    borderRadius: {
      control: { type: 'select' },
      options: ['', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'circle'],
      name: 'border-radius',
      description: 'Token scale or raw CSS value.',
    },
    borderWidth: {
      control: { type: 'select' },
      options: ['', '0', '1', '2', '4'],
      name: 'border-width',
      description:
        'Token scale (0 / 1 / 2 / 4 → 0px / 1px / 2px / 4px) or raw CSS value.',
    },
    borderColor: {
      control: { type: 'select' },
      options: BORDER_COLOR_OPTIONS,
      name: 'border-color',
      description: 'Semantic alias (`neutral/default`) or raw CSS value.',
    },
    overflow: {
      control: { type: 'select' },
      options: ['', 'visible', 'hidden', 'scroll', 'auto'],
    },
    as: {
      control: { type: 'select' },
      options: ['div', 'section', 'article', 'main', 'aside'],
    },
  },
};

const Template = ({
  padding,
  paddingX,
  paddingY,
  background,
  borderRadius,
  borderWidth,
  borderColor,
  overflow,
  as: asTag,
}) => `
  <lui-box
    ${padding ? `padding="${padding}"` : ''}
    ${paddingX ? `padding-x="${paddingX}"` : ''}
    ${paddingY ? `padding-y="${paddingY}"` : ''}
    ${background ? `background="${background}"` : ''}
    ${borderRadius ? `border-radius="${borderRadius}"` : ''}
    ${borderWidth ? `border-width="${borderWidth}"` : ''}
    ${borderColor ? `border-color="${borderColor}"` : ''}
    ${overflow ? `overflow="${overflow}"` : ''}
    as="${asTag}"
  >
    <p style="margin: 0; font-size: 14px;">Box content</p>
  </lui-box>
`;

export const Default = Template.bind({});
Default.args = {
  padding: 'md',
  paddingX: '',
  paddingY: '',
  background: 'neutral/surface',
  borderRadius: 'md',
  borderWidth: '1',
  borderColor: 'neutral/subtle',
  overflow: '',
  as: 'div',
};

export const Card = () => `
  <lui-box
    padding="lg"
    background="neutral/surface"
    border-radius="md"
    border-width="1"
    border-color="neutral/subtle"
  >
    <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px;">Card title</p>
    <p style="margin: 0; font-size: 13px; opacity: 0.6;">Surface background with subtle border.</p>
  </lui-box>
`;
Card.storyName = 'Card (semantic tokens)';

export const BackgroundVariants = () => `
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 16px;">
    ${BG_OPTIONS.filter(Boolean)
      .map(
        (alias) => `
      <lui-box padding="sm" background="${alias}" border-radius="xs">
        <p style="margin: 0; font-size: 11px; font-family: monospace; opacity: 0.75;">${alias}</p>
      </lui-box>
    `
      )
      .join('')}
  </div>
`;
BackgroundVariants.storyName = 'background — all semantic aliases';

export const BorderRadiusVariants = () => `
  <div style="display: flex; flex-wrap: wrap; gap: 12px; padding: 16px;">
    ${['none', 'xs', 'sm', 'md', 'lg', 'xl', 'circle']
      .map(
        (r) => `
      <lui-box
        padding="md"
        background="neutral/surface"
        border-radius="${r}"
        border-width="1"
        border-color="neutral/default"
        style="min-width: 96px; text-align: center;"
      >
        <p style="margin: 0; font-size: 11px; font-family: monospace;">${r}</p>
      </lui-box>
    `
      )
      .join('')}
  </div>
`;
BorderRadiusVariants.storyName = 'border-radius — scale';

export const BorderColorVariants = () => `
  <div style="display: flex; flex-wrap: wrap; gap: 12px; padding: 16px;">
    ${[
      { bg: 'neutral/surface', bc: 'neutral/subtle', label: 'neutral/subtle' },
      {
        bg: 'neutral/surface',
        bc: 'neutral/default',
        label: 'neutral/default',
      },
      {
        bg: 'primary/surface',
        bc: 'primary/default',
        label: 'primary/default',
      },
      {
        bg: 'secondary/surface',
        bc: 'secondary/default',
        label: 'secondary/default',
      },
      {
        bg: 'caution/surface',
        bc: 'caution/default',
        label: 'caution/default',
      },
      { bg: 'info/surface', bc: 'info/default', label: 'info/default' },
      { bg: 'danger/surface', bc: 'danger/default', label: 'danger/default' },
      {
        bg: 'success/surface',
        bc: 'success/default',
        label: 'success/default',
      },
    ]
      .map(
        ({ bg, bc, label }) => `
      <lui-box
        padding="md"
        background="${bg}"
        border-radius="sm"
        border-width="2"
        border-color="${bc}"
        style="min-width: 148px;"
      >
        <p style="margin: 0; font-size: 11px; font-family: monospace;">${label}</p>
      </lui-box>
    `
      )
      .join('')}
  </div>
`;
BorderColorVariants.storyName = 'border-color — semantic aliases';

export const RawCSSFallback = () => `
  <div style="display: flex; gap: 12px; padding: 16px;">
    <lui-box
      padding="md"
      background="#fef9c3"
      border-radius="12px"
      border-width="2px"
      border-color="#ca8a04"
    >
      <p style="margin: 0; font-size: 12px; font-family: monospace;">raw CSS values</p>
    </lui-box>
    <lui-box
      padding="md"
      background="var(--lui-color-neutral-background-surface)"
      border-radius="var(--lui-border-radius-md)"
      border-width="1px"
      border-color="var(--lui-color-neutral-border-subtle)"
    >
      <p style="margin: 0; font-size: 12px; font-family: monospace;">raw var() references</p>
    </lui-box>
  </div>
`;
RawCSSFallback.storyName = 'Raw CSS fallback';
