import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Actionable/Button',
  argTypes: {
    label: {
      control: 'text',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'neutral', 'danger', 'success'],
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
      table: { defaultValue: { summary: 'lg' } },
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    block: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    type: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
      table: { defaultValue: { summary: 'button' } },
    },
    autofocus: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    'loading-text': {
      control: 'text',
    },
    'aria-label': {
      control: 'text',
    },
  },
};

const Template = ({
  label,
  variant,
  size,
  type,
  autofocus,
  disabled,
  block,
  loading,
  'loading-text': loadingText,
  'aria-label': ariaLabel,
}) => {
  const attrs = [
    `variant="${variant}"`,
    `size="${size}"`,
    type !== 'button' && `type="${type}"`,
    autofocus && 'autofocus',
    disabled && 'disabled',
    block && 'block',
    loading && 'loading',
    loadingText && `loading-text="${loadingText}"`,
    ariaLabel && `aria-label="${ariaLabel}"`,
  ]
    .filter(Boolean)
    .join('\n  ');

  return `<lui-button\n  ${attrs}\n>\n  ${label}\n</lui-button>`;
};

export const Button = Template.bind({});
Button.args = {
  label: 'Botão',
  'aria-label': '',
  variant: 'primary',
  size: 'lg',
  type: 'button',
  block: false,
  autofocus: false,
  disabled: false,
  loading: false,
  'loading-text': '',
};

export const Primary = () =>
  `<lui-button variant="primary" size="lg" label="Primary"></lui-button>`;

export const Secondary = () =>
  `<lui-button variant="secondary" size="lg" label="Secondary"></lui-button>`;

export const Neutral = () =>
  `<lui-button variant="neutral" size="lg" label="Neutral"></lui-button>`;

export const Danger = () =>
  `<lui-button variant="danger" size="lg" label="Danger"></lui-button>`;

export const Success = () =>
  `<lui-button variant="success" size="lg" label="Success"></lui-button>`;

export const Disabled = () =>
  `<lui-button variant="primary" size="lg" label="Disabled" disabled></lui-button>`;

export const Block = () =>
  `<div style="width: 320px; padding: 16px; border: 1px dashed #ccc; border-radius: 8px;">
    <lui-button variant="primary" size="lg" label="Block Button" block></lui-button>
  </div>`;

export const Loading = () =>
  `<lui-button variant="primary" size="lg" label="Salvar" loading></lui-button>`;

export const LoadingWithText = () =>
  `<lui-button variant="primary" size="lg" label="Salvar" loading loading-text="Salvando..."></lui-button>`;

export const AllVariantsLoading = () =>
  `<div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <lui-button variant="primary" size="lg" label="Primary" loading></lui-button>
    <lui-button variant="secondary" size="lg" label="Secondary" loading></lui-button>
    <lui-button variant="neutral" size="lg" label="Neutral" loading></lui-button>
    <lui-button variant="danger" size="lg" label="Danger" loading></lui-button>
    <lui-button variant="success" size="lg" label="Success" loading></lui-button>
  </div>`;

export const Label = () =>
  `<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
    <lui-button variant="primary" size="lg" label="Label via atributo"></lui-button>
  </div>`;
Label.parameters = {
  docs: {
    description: {
      story:
        'O texto pode ser passado via atributo `label` ou como conteúdo do slot padrão. Quando o slot é preenchido, ele tem precedência na exibição. O `label` também serve como fallback de `aria-label` quando nenhum texto acessível explícito é fornecido.',
    },
  },
};

const prefixIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" slot="prefix"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M8 12l4 4 4-4M12 4v12"/></svg>`;
const suffixIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" slot="suffix"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>`;

export const WithIcon = () =>
  `<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
    <lui-button variant="primary" size="lg">${prefixIcon}Baixar</lui-button>
    <lui-button variant="secondary" size="md">Próximo${suffixIcon}</lui-button>
  </div>`;
WithIcon.parameters = {
  docs: {
    description: {
      story:
        'Use `slot="prefix"` para ícones antes do label e `slot="suffix"` para ícones após. Os ícones herdam `currentColor` e escalam com o tamanho de fonte do botão via `1em`.',
    },
  },
};

export const Autofocus = () =>
  `<div style="display: flex; gap: 12px; align-items: center;">
    <lui-button variant="secondary" size="lg">Cancelar</lui-button>
    <lui-button variant="primary" size="lg" autofocus>Confirmar</lui-button>
  </div>`;
Autofocus.parameters = {
  docs: {
    description: {
      story:
        'O botão com `autofocus` recebe foco automaticamente quando o contexto é carregado. Neste preview, o botão "Confirmar" já está focado ao abrir a story.',
    },
  },
};
