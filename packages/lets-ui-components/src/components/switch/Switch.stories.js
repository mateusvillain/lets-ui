import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/Switch',
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text', table: { defaultValue: { summary: 'on' } } },
    form: { control: 'text' },
    checked: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
      table: { defaultValue: { summary: 'lg' } },
    },
  },
};

const Template = ({
  label,
  name,
  value,
  form,
  checked,
  disabled,
  required,
  size,
}) => {
  const attrs = [
    `size="${size ?? 'lg'}"`,
    name ? `name="${name}"` : '',
    value && value !== 'on' ? `value="${value}"` : '',
    form ? `form="${form}"` : '',
    checked ? 'checked' : '',
    disabled ? 'disabled' : '',
    required ? 'required' : '',
  ]
    .filter(Boolean)
    .join('\n  ');

  return `<lui-switch\n  ${attrs}\n>\n  ${label ?? ''}\n</lui-switch>`;
};

export const Default = Template.bind({});
Default.args = {
  label: 'Switch label',
  name: '',
  value: 'on',
  form: '',
  checked: false,
  disabled: false,
  required: false,
  size: 'lg',
};

export const LabelAttribute = () =>
  `<lui-switch label="Opção via atributo" size="lg"></lui-switch>`;
LabelAttribute.storyName = 'Label (atributo)';
LabelAttribute.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'Fallback para texto simples: o atributo `label` é renderizado como conteúdo padrão do slot quando nenhum conteúdo é projetado.',
    },
  },
};

export const Checked = () =>
  `<lui-switch checked size="lg">Ativado</lui-switch>`;

export const Small = () => `<lui-switch size="md">Label</lui-switch>`;

export const Disabled = () =>
  `<lui-switch disabled size="lg">Desabilitado</lui-switch>`;

export const DisabledChecked = () =>
  `<lui-switch checked disabled size="lg">Desabilitado ativado</lui-switch>`;

export const Group = () => `
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <lui-switch checked size="lg">Receber notificações</lui-switch>
    <lui-switch size="lg">Modo escuro</lui-switch>
    <lui-switch disabled size="lg">Salvar histórico (desabilitado)</lui-switch>
  </div>
`;
Group.parameters = { controls: { disable: true } };

export const FormIntegration = () => {
  const container = document.createElement('div');
  container.style.cssText =
    'max-width: 360px; display: flex; flex-direction: column; gap: 24px;';
  container.innerHTML = `
    <form id="switch-demo-form" style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <lui-switch name="notifications" value="enabled" checked size="lg">Receber notificações</lui-switch>
        <lui-switch name="darkmode" value="enabled" size="lg">Modo escuro</lui-switch>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <lui-button type="reset" variant="secondary" size="md">Cancelar</lui-button>
        <lui-button type="submit" variant="primary" size="md">Salvar</lui-button>
      </div>
    </form>
    <p id="switch-demo-feedback" style="font-size: 13px; min-height: 18px;"></p>
  `;

  const form = container.querySelector('#switch-demo-form');
  const feedback = container.querySelector('#switch-demo-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const notifications = data.get('notifications') ? 'ativado' : 'desativado';
    const darkmode = data.get('darkmode') ? 'ativado' : 'desativado';
    feedback.style.color = 'green';
    feedback.textContent = `✓ Notificações: ${notifications} · Modo escuro: ${darkmode}`;
  });

  form.addEventListener('reset', () => {
    feedback.textContent = '';
  });

  return container;
};
FormIntegration.storyName = 'Form Integration';
FormIntegration.parameters = {
  docs: {
    description: {
      story:
        'Quando ativado, submete `value` no `FormData` com a chave `name`. Quando desativado, o campo é omitido — idêntico ao comportamento nativo de checkbox.',
    },
  },
};
