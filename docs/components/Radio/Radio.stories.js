import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Form and options/Radio',
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
  `<lui-radio
    label="${label ?? ''}"
    size="${size}"
    name="story-radio"
    value="${label ?? ''}"
    ${checked ? 'checked' : ''}
    ${disabled ? 'disabled' : ''}
  ></lui-radio>`;

export const Radio = Template.bind({});
Radio.args = {
  label: 'Radio label',
  checked: false,
  disabled: false,
  size: 'lg',
};

export const Checked = Template.bind({});
Checked.args = {
  label: 'Selected option',
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
  label: 'Label',
  checked: true,
  disabled: true,
  size: 'lg',
};

export const Group = () => `
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <lui-radio label="Opção 1" name="story-group" value="opt1" checked size="lg"></lui-radio>
    <lui-radio label="Opção 2" name="story-group" value="opt2" size="lg"></lui-radio>
    <lui-radio label="Opção 3 (desabilitado)" name="story-group" value="opt3" disabled size="lg"></lui-radio>
  </div>
`;
Group.parameters = { controls: { disable: true } };
