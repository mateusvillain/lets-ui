import 'lets-ui-icons/dist/lets-ui-icons.css';
import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Content/Drawer',
  argTypes: {
    title: { control: 'text' },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    triggerLabel: { control: 'text' },
    closeOnBackdrop: { control: 'boolean' },
  },
};

const Template = ({ title, size, triggerLabel, closeOnBackdrop }) => {
  const attrs = [
    `title="${title ?? 'Drawer title'}"`,
    `size="${size ?? 'md'}"`,
    `trigger-label="${triggerLabel ?? 'Abrir drawer'}"`,
    closeOnBackdrop ? 'close-on-backdrop' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <lui-drawer ${attrs}>
      <p>Conteúdo do drawer. Pode ser qualquer elemento HTML ou componente.</p>
      <p style="margin-top: 12px;">Use o drawer para exibir detalhes, configurações ou ações secundárias sem sair do contexto da página principal.</p>
      <button slot="actions" data-drawer-close class="btn btn--secondary btn--lg">Cancelar</button>
      <button slot="actions" class="btn btn--primary btn--lg">Confirmar</button>
    </lui-drawer>
  `;
};

export const Drawer = Template.bind({});
Drawer.args = {
  title: 'Título do drawer',
  size: 'md',
  triggerLabel: 'Abrir drawer',
  closeOnBackdrop: true,
};

export const Small = Template.bind({});
Small.args = {
  ...Drawer.args,
  title: 'Drawer pequeno',
  size: 'sm',
};

export const Large = Template.bind({});
Large.args = {
  ...Drawer.args,
  title: 'Drawer grande',
  size: 'lg',
};

export const WithoutActions = () => `
  <lui-drawer title="Drawer sem ações" trigger-label="Abrir drawer" close-on-backdrop>
    <p>Este drawer não possui botões de ação no rodapé.</p>
  </lui-drawer>
`;
WithoutActions.storyName = 'Sem ações';

export const CloseOnBackdropOff = Template.bind({});
CloseOnBackdropOff.args = {
  ...Drawer.args,
  title: 'Fechar apenas pelo X ou botão',
  closeOnBackdrop: false,
};
CloseOnBackdropOff.storyName = 'close-on-backdrop: false';

export const XLarge = Template.bind({});
XLarge.args = {
  ...Drawer.args,
  title: 'Drawer extra grande',
  size: 'xl',
};
XLarge.storyName = 'Extra Large (xl)';

export const CustomTrigger = () => `
  <lui-drawer title="Drawer com trigger customizado" close-on-backdrop>
    <button slot="trigger" class="btn btn--secondary btn--lg">
      <i class="lui lui-settings" aria-hidden="true"></i>
      Configurações
    </button>
    <p>Conteúdo do drawer com trigger totalmente customizado via <code>slot="trigger"</code>.</p>
    <p style="margin-top: 12px;">Qualquer elemento ou componente pode ser o trigger — basta adicionar o atributo <code>slot="trigger"</code>.</p>
    <button slot="actions" data-drawer-close class="btn btn--secondary btn--lg">Cancelar</button>
    <button slot="actions" class="btn btn--primary btn--lg">Confirmar</button>
  </lui-drawer>
`;
CustomTrigger.storyName = 'Trigger customizado (slot)';
