import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

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

const Template = ({ label, checked, disabled, size }) =>
  `<lui-switch
    label="${label ?? ''}"
    size="${size}"
    ${checked ? 'checked' : ''}
    ${disabled ? 'disabled' : ''}
  ></lui-switch>`;

export const Default = Template.bind({});
Default.args = {
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

export const Group = () => `
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <lui-switch label="Receber notificações" checked size="lg"></lui-switch>
    <lui-switch label="Modo escuro" size="lg"></lui-switch>
    <lui-switch label="Salvar histórico (desabilitado)" disabled size="lg"></lui-switch>
  </div>
`;
Group.parameters = { controls: { disable: true } };
