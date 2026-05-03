import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Typography/Heading',
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
    as: { control: 'text' },
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
  as,
  align,
  lineClamp,
  transform,
  color = 'heading',
  text,
}) => {
  const defaultTags = {
    display: 'div',
    title: 'h1',
    subtitle: 'h2',
    headline: 'h3',
    subheadline: 'h4',
    'block-title': 'h5',
    overtitle: 'h6',
  };

  const tag = as || defaultTags[variant];

  const classes = [
    variant,
    `text--color-${color}`,
    align && `text--align-${align}`,
    transform && transform !== '' && `text--transform-${transform}`,
  ]
    .filter(Boolean)
    .join(' ');

  const styleAttr = lineClamp
    ? ` style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: ${lineClamp}; -webkit-box-orient: vertical;"`
    : '';

  return `<${tag} class="${classes}"${styleAttr}>${text}</${tag}>`;
};

export const Heading = Template.bind({});
Heading.args = {
  variant: 'title',
  color: 'heading',
  text: 'Título da página',
};

export const Display = () =>
  `<div class="display text--color-heading">Display — O maior nível tipográfico</div>`;

export const Title = () =>
  `<h1 class="title text--color-heading">Title — Título principal da página</h1>`;

export const Subtitle = () =>
  `<h2 class="subtitle text--color-heading">Subtitle — Seção secundária</h2>`;

export const HeadlineVariant = () =>
  `<h3 class="headline text--color-heading">Headline — Destaque de conteúdo</h3>`;

export const Subheadline = () =>
  `<h4 class="subheadline text--color-heading">Subheadline — Sub-seção de conteúdo</h4>`;

export const BlockTitle = () =>
  `<h5 class="block-title text--color-heading">Block Title — Título de bloco</h5>`;

export const Overtitle = () =>
  `<h6 class="overtitle text--color-heading">Overtitle — Rótulo acima do título</h6>`;

export const AllVariants = () => `
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div class="display text--color-heading">Display</div>
    <h1 class="title text--color-heading">Title</h1>
    <h2 class="subtitle text--color-heading">Subtitle</h2>
    <h3 class="headline text--color-heading">Headline</h3>
    <h4 class="subheadline text--color-heading">Subheadline</h4>
    <h5 class="block-title text--color-heading">Block Title</h5>
    <h6 class="overtitle text--color-heading">Overtitle</h6>
  </div>
`;

export const ColorVariants = () => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <h2 class="subtitle text--color-heading">Color: heading (default)</h2>
    <h2 class="subtitle text--color-body">Color: body</h2>
    <h2 class="subtitle text--color-caption">Color: caption</h2>
    <h2 class="subtitle text--color-error">Color: error</h2>
    <div style="background: var(--lui-color-neutral-bg-surface-neutral); padding: 8px; border-radius: 4px;">
      <h2 class="subtitle text--color-inverse">Color: inverse</h2>
    </div>
  </div>
`;

export const Aligned = () => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <h2 class="subtitle text--color-heading text--align-left">Alinhamento à esquerda</h2>
    <h2 class="subtitle text--color-heading text--align-center">Alinhamento centralizado</h2>
    <h2 class="subtitle text--color-heading text--align-right">Alinhamento à direita</h2>
  </div>
`;

export const WithLineClamp = () => `
  <h2
    class="subtitle text--color-heading"
    style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; max-width: 400px;"
  >
    Este texto é longo o suficiente para ser cortado em duas linhas. Quanto mais
    texto houver aqui, mais evidente fica o comportamento do line-clamp em ação.
  </h2>
`;
