import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Actionable/Close Button',
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

const Template = ({ size, label, disabled }) =>
  `<lui-close-button
    size="${size}"
    label="${label}"
    ${disabled ? 'disabled' : ''}
  ></lui-close-button>`;

export const CloseButton = Template.bind({});
CloseButton.args = {
  size: 'md',
  label: 'Close',
  disabled: false,
};

export const SizeSm = Template.bind({});
SizeSm.args = { size: 'sm', label: 'Close', disabled: false };
SizeSm.storyName = 'Size: Small';

export const SizeMd = Template.bind({});
SizeMd.args = { size: 'md', label: 'Close', disabled: false };
SizeMd.storyName = 'Size: Medium';

export const SizeLg = Template.bind({});
SizeLg.args = { size: 'lg', label: 'Close', disabled: false };
SizeLg.storyName = 'Size: Large';

export const Disabled = Template.bind({});
Disabled.args = { size: 'md', label: 'Close', disabled: true };

export const AllSizes = () => `
  <div style="display: flex; gap: 16px; align-items: center;">
    <lui-close-button size="sm" label="Close small"></lui-close-button>
    <lui-close-button size="md" label="Close medium"></lui-close-button>
    <lui-close-button size="lg" label="Close large"></lui-close-button>
  </div>
`;
AllSizes.storyName = 'Todos os tamanhos';
AllSizes.parameters = { controls: { disable: true } };

export const InsideAlert = () => `
  <lui-alert
    variant="info"
    title="Informação importante"
    content="Este alert pode ser descartado clicando no botão fechar."
    dismissible
  ></lui-alert>
`;
InsideAlert.storyName = 'Dentro do Alert (dismissible)';
InsideAlert.parameters = { controls: { disable: true } };

export const InsideModal = () => `
  <lui-modal title="Modal title" trigger-label="Abrir modal">
    <p>O botão X no cabeçalho é um componente close-button.</p>
  </lui-modal>
`;
InsideModal.storyName = 'Dentro do Modal';
InsideModal.parameters = {
  controls: { disable: true },
  docs: { story: { height: '400px' } },
};

export const CSSClass = () => `
  <button class="close-button close-button--lg" aria-label="Close">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.4697 5.46973C17.7626 5.17683 18.2373 5.17683 18.5302 5.46973C18.8231 5.76262 18.8231 6.23738 18.5302 6.53027L13.0605 12L18.5302 17.4697C18.8231 17.7626 18.8231 18.2374 18.5302 18.5303C18.2373 18.8232 17.7626 18.8232 17.4697 18.5303L11.9999 13.0605L6.53022 18.5303C6.23732 18.8232 5.76256 18.8232 5.46967 18.5303C5.17678 18.2374 5.17678 17.7626 5.46967 17.4697L10.9394 12L5.46967 6.53027C5.17678 6.23738 5.17678 5.76262 5.46967 5.46973C5.76256 5.17683 6.23732 5.17683 6.53022 5.46973L11.9999 10.9395L17.4697 5.46973Z"/>
    </svg>
  </button>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
