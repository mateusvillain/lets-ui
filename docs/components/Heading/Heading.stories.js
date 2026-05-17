import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Content/Typography/Heading',
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'display',
        'title',
        'subtitle',
        'headline',
        'subheadline',
        'block-title',
        'overtitle',
      ],
    },
    align: {
      control: { type: 'select' },
      options: ['', 'left', 'center', 'right', 'justify'],
    },
    lineClamp: { control: 'number' },
    transform: {
      control: { type: 'select' },
      options: ['', 'none', 'uppercase', 'lowercase', 'capitalize'],
    },
    color: {
      control: { type: 'select' },
      options: ['heading', 'body', 'caption', 'primary', 'inverse', 'error'],
    },
    text: { control: 'text' },
  },
};

const Template = ({
  variant = 'title',
  align,
  lineClamp,
  transform,
  color = 'heading',
  text,
}) =>
  `<lui-heading
    variant="${variant}"
    color="${color}"
    label="${text}"
    ${align ? `align="${align}"` : ''}
    ${lineClamp ? `line-clamp="${lineClamp}"` : ''}
    ${transform && transform !== '' ? `transform="${transform}"` : ''}
  ></lui-heading>`;

export const Heading = Template.bind({});
Heading.args = {
  variant: 'title',
  color: 'heading',
  text: 'Título da página',
};

export const Display = () =>
  `<lui-heading variant="display" color="heading" label="Display — O maior nível tipográfico"></lui-heading>`;

export const Title = () =>
  `<lui-heading variant="title" color="heading" label="Title — Título principal da página"></lui-heading>`;

export const Subtitle = () =>
  `<lui-heading variant="subtitle" color="heading" label="Subtitle — Seção secundária"></lui-heading>`;

export const HeadlineVariant = () =>
  `<lui-heading variant="headline" color="heading" label="Headline — Destaque de conteúdo"></lui-heading>`;

export const Subheadline = () =>
  `<lui-heading variant="subheadline" color="heading" label="Subheadline — Sub-seção de conteúdo"></lui-heading>`;

export const BlockTitle = () =>
  `<lui-heading variant="block-title" color="heading" label="Block Title — Título de bloco"></lui-heading>`;

export const Overtitle = () =>
  `<lui-heading variant="overtitle" color="heading" label="Overtitle — Rótulo acima do título"></lui-heading>`;

export const AllVariants = () => `
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <lui-heading variant="display" color="heading" label="Display"></lui-heading>
    <lui-heading variant="title" color="heading" label="Title"></lui-heading>
    <lui-heading variant="subtitle" color="heading" label="Subtitle"></lui-heading>
    <lui-heading variant="headline" color="heading" label="Headline"></lui-heading>
    <lui-heading variant="subheadline" color="heading" label="Subheadline"></lui-heading>
    <lui-heading variant="block-title" color="heading" label="Block Title"></lui-heading>
    <lui-heading variant="overtitle" color="heading" label="Overtitle"></lui-heading>
  </div>
`;

export const ColorVariants = () => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <lui-heading variant="subtitle" color="heading" label="Color: heading (default)"></lui-heading>
    <lui-heading variant="subtitle" color="body" label="Color: body"></lui-heading>
    <lui-heading variant="subtitle" color="caption" label="Color: caption"></lui-heading>
    <lui-heading variant="subtitle" color="error" label="Color: error"></lui-heading>
    <div style="background: var(--lui-color-neutral-bg-surface-neutral); padding: 8px; border-radius: 4px;">
      <lui-heading variant="subtitle" color="inverse" label="Color: inverse"></lui-heading>
    </div>
  </div>
`;

export const Aligned = () => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <lui-heading variant="subtitle" color="heading" align="left" label="Alinhamento à esquerda"></lui-heading>
    <lui-heading variant="subtitle" color="heading" align="center" label="Alinhamento centralizado"></lui-heading>
    <lui-heading variant="subtitle" color="heading" align="right" label="Alinhamento à direita"></lui-heading>
  </div>
`;

export const WithLineClamp = () => `
  <lui-heading
    variant="subtitle"
    color="heading"
    line-clamp="2"
    label="Este texto é longo o suficiente para ser cortado em duas linhas. Quanto mais texto houver aqui, mais evidente fica o comportamento do line-clamp em ação."
    style="max-width: 400px; display: block;"
  ></lui-heading>
`;
