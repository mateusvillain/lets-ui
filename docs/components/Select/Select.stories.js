import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Form and options/Native Select',
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    options: { control: 'text' },
    selected: { control: 'number' },
    optional: { control: 'boolean' },
    optionalText: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'boolean' },
    errorText: { control: 'text' },
    icon: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm'],
    },
    forceState: {
      control: { type: 'select' },
      options: ['', 'hovered', 'focused'],
    },
  },
};

const Template = ({
  label = 'Label',
  placeholder = 'Select an option',
  options = 'Option 1,Option 2',
  selected = 0,
  optional,
  optionalText,
  hint,
  error,
  errorText,
  icon,
  disabled,
  size = 'lg',
  forceState,
}) => {
  const attrs = [
    `label="${label ?? ''}"`,
    `placeholder="${placeholder ?? ''}"`,
    `options="${options ?? ''}"`,
    Number.isFinite(Number(selected)) ? `selected="${Number(selected)}"` : '',
    `size="${size ?? 'lg'}"`,
    optional ? 'optional' : '',
    optionalText ? `optional-text="${optionalText}"` : '',
    hint ? `hint="${hint}"` : '',
    error ? 'error' : '',
    errorText ? `error-text="${errorText}"` : '',
    icon ? 'icon' : '',
    disabled ? 'disabled' : '',
    forceState ? `force-state="${forceState}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <div style="width: 244px;">
      <lui-native-select ${attrs}></lui-native-select>
    </div>
  `;
};

export const NativeSelect = Template.bind({});
NativeSelect.args = {
  label: 'Label',
  placeholder: 'Select an option',
  options: 'Option 1,Option 2,Option 3',
  selected: 1,
  optional: true,
  optionalText: '(opcional)',
  hint: 'Hint text',
  error: false,
  errorText: 'Campo obrigatório.',
  icon: true,
  disabled: false,
  size: 'lg',
  forceState: '',
};

export const Hover = Template.bind({});
Hover.args = {
  ...NativeSelect.args,
  forceState: 'hovered',
};

export const Focus = Template.bind({});
Focus.args = {
  ...NativeSelect.args,
  forceState: 'focused',
};

export const Error = Template.bind({});
Error.args = {
  ...NativeSelect.args,
  selected: 0,
  hint: '',
  error: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...NativeSelect.args,
  disabled: true,
};
