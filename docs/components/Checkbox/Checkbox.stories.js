import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

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

const Template = ({ label, checked, disabled, size }) => {
  const sizeClass = size ? `checkbox--${size}` : '';

  return `
    <label class="checkbox ${sizeClass}">
      <input type="checkbox" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <span>${label || ''}</span>
    </label>
  `;
};

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
