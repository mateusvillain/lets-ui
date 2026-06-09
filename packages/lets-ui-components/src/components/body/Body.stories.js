import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Typography/Body',
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm'],
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
      options: ['body', 'heading', 'caption', 'primary', 'inverse', 'error'],
    },
    italic: { control: 'boolean' },
    underline: { control: 'boolean' },
    text: { control: 'text' },
  },
};

const Template = ({
  variant = 'md',
  align,
  lineClamp,
  transform,
  color = 'body',
  italic = false,
  underline = false,
  text,
}) =>
  `<lui-body
    variant="${variant}"
    color="${color}"
    label="${text}"
    ${align ? `align="${align}"` : ''}
    ${lineClamp ? `line-clamp="${lineClamp}"` : ''}
    ${transform && transform !== '' ? `transform="${transform}"` : ''}
    ${italic ? 'italic' : ''}
    ${underline ? 'underline' : ''}
  ></lui-body>`;

export const Body = Template.bind({});
Body.args = {
  variant: 'md',
  color: 'body',
  italic: false,
  underline: false,
  text: 'O componente Body exibe texto de conteúdo com variações de tamanho, cor e estilo.',
};

export const SizeLg = () =>
  `<lui-body variant="lg" color="body" label="Large — Texto de destaque ou introdução"></lui-body>`;

export const SizeMd = () =>
  `<lui-body variant="md" color="body" label="Medium — Texto padrão para conteúdo geral"></lui-body>`;

export const SizeSm = () =>
  `<lui-body variant="sm" color="body" label="Small — Texto auxiliar, legendas e notas"></lui-body>`;

export const AllSizes = () => `
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <lui-body variant="lg" color="body" label="Large — Lorem ipsum dolor sit amet, consectetur adipiscing elit."></lui-body>
    <lui-body variant="md" color="body" label="Medium — Lorem ipsum dolor sit amet, consectetur adipiscing elit."></lui-body>
    <lui-body variant="sm" color="body" label="Small — Lorem ipsum dolor sit amet, consectetur adipiscing elit."></lui-body>
  </div>
`;

export const ColorVariants = () => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <lui-body variant="md" color="body" label="Color: body (default)"></lui-body>
    <lui-body variant="md" color="heading" label="Color: heading"></lui-body>
    <lui-body variant="md" color="caption" label="Color: caption"></lui-body>
    <lui-body variant="md" color="error" label="Color: error"></lui-body>
    <div style="background: var(--lui-color-neutral-bg-surface-neutral); padding: 8px; border-radius: 4px;">
      <lui-body variant="md" color="inverse" label="Color: inverse"></lui-body>
    </div>
  </div>
`;

export const Italic = () =>
  `<lui-body variant="md" color="body" italic label="Texto em estilo itálico para ênfase suave."></lui-body>`;

export const Underline = () =>
  `<lui-body variant="md" color="body" underline label="Texto sublinhado para destaque especial."></lui-body>`;

export const ItalicUnderline = () =>
  `<lui-body variant="md" color="body" italic underline label="Texto em itálico e sublinhado simultaneamente."></lui-body>`;

export const Aligned = () => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <lui-body variant="md" color="body" align="left" label="Alinhamento à esquerda"></lui-body>
    <lui-body variant="md" color="body" align="center" label="Alinhamento centralizado"></lui-body>
    <lui-body variant="md" color="body" align="right" label="Alinhamento à direita"></lui-body>
    <lui-body variant="md" color="body" align="justify" label="Texto justificado — o espaçamento entre palavras é ajustado para preencher a largura disponível da linha de forma uniforme." style="max-width: 400px; display: block;"></lui-body>
  </div>
`;

export const WithLineClamp = () => `
  <lui-body
    variant="md"
    color="body"
    line-clamp="3"
    label="Este parágrafo tem conteúdo suficiente para demonstrar o comportamento de corte por número de linhas. O line-clamp limita a exibição a três linhas e oculta o restante do texto com reticências no final da última linha visível."
    style="max-width: 400px; display: block;"
  ></lui-body>
`;

export const CSSClass = () => `
  <p class="body--md">Texto com escala tipográfica body médio.</p>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
