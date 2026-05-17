import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Form and options/Checkbox',
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
  `<lui-checkbox
    label="${label ?? ''}"
    size="${size}"
    ${checked ? 'checked' : ''}
    ${disabled ? 'disabled' : ''}
  ></lui-checkbox>`;

export const Checkbox = Template.bind({});
Checkbox.args = {
  label: 'Checkbox label',
  checked: false,
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
