import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Form and options/Switch',
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
    },
  },
};

const Template = ({ label, checked, disabled, size }) => {
  const sizeClass = size ? `switch--${size}` : '';

  return `
    <label class="switch ${sizeClass}">
      <input type="checkbox" role="switch" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <span>${label || ''}</span>
    </label>
  `;
};

export const Switch = Template.bind({});
Switch.args = {
  label: 'Switch label',
  checked: false,
  disabled: false,
  size: 'lg',
};

export const Checked = Template.bind({});
Checked.args = {
  label: 'Ativado',
  checked: true,
  disabled: false,
  size: 'lg',
};

export const Small = Template.bind({});
Small.args = {
  label: 'Label',
  checked: false,
  disabled: false,
  size: 'md',
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Desabilitado',
  checked: false,
  disabled: true,
  size: 'lg',
};

export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  label: 'Desabilitado ativado',
  checked: true,
  disabled: true,
  size: 'lg',
};

const GroupTemplate = () => `
  <fieldset style="border: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
    <legend style="font-weight: 600; margin-bottom: 8px;">Preferências</legend>
    <label class="switch switch--lg">
      <input type="checkbox" role="switch" checked>
      <span>Receber notificações</span>
    </label>
    <label class="switch switch--lg">
      <input type="checkbox" role="switch">
      <span>Modo escuro</span>
    </label>
    <label class="switch switch--lg">
      <input type="checkbox" role="switch" disabled>
      <span>Salvar histórico (desabilitado)</span>
    </label>
  </fieldset>
`;

export const Group = GroupTemplate.bind({});
Group.parameters = { controls: { disable: true } };
