import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Components/Body',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm'],
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
      options: ['body', 'heading', 'caption', 'inverse', 'error'],
    },
    italic: { control: 'boolean' },
    underline: { control: 'boolean' },
    text: { control: 'text' },
  },
};

const Template = ({
  variant = 'md',
  as = 'p',
  align,
  lineClamp,
  transform,
  color = 'body',
  italic = false,
  underline = false,
  text,
}) => {
  const classes = [
    `body--${variant}`,
    `lui-body--color-${color}`,
    align && `typography--align-${align}`,
    transform && transform !== '' && `typography--transform-${transform}`,
    italic && 'lui-body--italic',
    underline && 'lui-body--underline',
  ]
    .filter(Boolean)
    .join(' ');

  const styleAttr = lineClamp
    ? ` style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: ${lineClamp}; -webkit-box-orient: vertical;"`
    : '';

  return `<${as} class="${classes}"${styleAttr}>${text}</${as}>`;
};

export const Body = Template.bind({});
Body.args = {
  variant: 'md',
  color: 'body',
  italic: false,
  underline: false,
  text: 'O componente Body exibe texto de conteúdo com variações de tamanho, cor e estilo.',
};

export const SizeLg = () =>
  `<p class="body--lg lui-body--color-body">Large — Texto de destaque ou introdução</p>`;

export const SizeMd = () =>
  `<p class="body--md lui-body--color-body">Medium — Texto padrão para conteúdo geral</p>`;

export const SizeSm = () =>
  `<p class="body--sm lui-body--color-body">Small — Texto auxiliar, legendas e notas</p>`;

export const AllSizes = () => `
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <p class="body--lg lui-body--color-body">Large — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <p class="body--md lui-body--color-body">Medium — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <p class="body--sm lui-body--color-body">Small — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  </div>
`;

export const ColorVariants = () => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <p class="body--md lui-body--color-body">Color: body (default)</p>
    <p class="body--md lui-body--color-heading">Color: heading</p>
    <p class="body--md lui-body--color-caption">Color: caption</p>
    <p class="body--md lui-body--color-error">Color: error</p>
    <div style="background: var(--lui-color-neutral-bg-surface-neutral); padding: 8px; border-radius: 4px;">
      <p class="body--md lui-body--color-inverse">Color: inverse</p>
    </div>
  </div>
`;

export const Italic = () =>
  `<p class="body--md lui-body--color-body lui-body--italic">Texto em estilo itálico para ênfase suave.</p>`;

export const Underline = () =>
  `<p class="body--md lui-body--color-body lui-body--underline">Texto sublinhado para destaque especial.</p>`;

export const ItalicUnderline = () =>
  `<p class="body--md lui-body--color-body lui-body--italic lui-body--underline">Texto em itálico e sublinhado simultaneamente.</p>`;

export const Aligned = () => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <p class="body--md lui-body--color-body typography--align-left">Alinhamento à esquerda</p>
    <p class="body--md lui-body--color-body typography--align-center">Alinhamento centralizado</p>
    <p class="body--md lui-body--color-body typography--align-right">Alinhamento à direita</p>
    <p class="body--md lui-body--color-body typography--align-justify" style="max-width: 400px;">Texto justificado — o espaçamento entre palavras é ajustado para preencher a largura disponível da linha de forma uniforme.</p>
  </div>
`;

export const WithLineClamp = () => `
  <p
    class="body--md lui-body--color-body"
    style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; max-width: 400px;"
  >
    Este parágrafo tem conteúdo suficiente para demonstrar o comportamento de
    corte por número de linhas. O line-clamp limita a exibição a três linhas
    e oculta o restante do texto com reticências no final da última linha visível.
  </p>
`;

export const AsSpan = () => `
  <p class="body--md lui-body--color-body">
    Texto normal com um
    <span class="body--md lui-body--color-error lui-body--underline">trecho destacado em vermelho</span>
    no meio do parágrafo.
  </p>
`;
