import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Form and options/Input',
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'number'],
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm'],
    },
    optional: { control: 'boolean' },
    optionalText: { control: 'text' },
    maxlength: { control: 'number' },
    hint: { control: 'text' },
    error: { control: 'boolean' },
    errorText: { control: 'text' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    forceState: {
      control: { type: 'select' },
      options: ['', 'hovered', 'focused'],
    },
  },
};

const Template = ({
  type,
  label,
  placeholder,
  value,
  size,
  optional,
  optionalText,
  maxlength,
  hint,
  error,
  errorText,
  icon,
  prefix,
  suffix,
  disabled,
  min,
  max,
  step,
  forceState,
}) => {
  const attrs = [
    `type="${type ?? 'text'}"`,
    `label="${label ?? ''}"`,
    `placeholder="${placeholder ?? ''}"`,
    `value="${value ?? ''}"`,
    `size="${size ?? 'lg'}"`,
    optional ? 'optional' : '',
    optionalText ? `optional-text="${optionalText}"` : '',
    Number.isFinite(Number(maxlength))
      ? `maxlength="${Number(maxlength)}"`
      : '',
    hint ? `hint="${hint}"` : '',
    error ? 'error' : '',
    errorText ? `error-text="${errorText}"` : '',
    icon ? 'icon' : '',
    prefix ? `prefix="${prefix}"` : '',
    suffix ? `suffix="${suffix}"` : '',
    disabled ? 'disabled' : '',
    Number.isFinite(Number(min)) ? `min="${Number(min)}"` : '',
    Number.isFinite(Number(max)) ? `max="${Number(max)}"` : '',
    Number.isFinite(Number(step)) ? `step="${Number(step)}"` : '',
    forceState ? `force-state="${forceState}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <div style="width: 244px;">
      <lui-input ${attrs}></lui-input>
    </div>
  `;
};

export const Input = Template.bind({});
Input.args = {
  type: 'text',
  label: 'Label',
  placeholder: 'Placeholder',
  value: '',
  size: 'lg',
  optional: true,
  optionalText: '(opcional)',
  maxlength: 100,
  hint: 'Hint text',
  error: false,
  errorText: 'Campo obrigatório.',
  icon: true,
  prefix: 'www.',
  suffix: '.com',
  disabled: false,
  min: undefined,
  max: undefined,
  step: undefined,
  forceState: '',
};

export const Error = Template.bind({});
Error.args = {
  ...Input.args,
  error: true,
  hint: '',
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Input.args,
  value: 'Value',
  disabled: true,
};

export const Password = Template.bind({});
Password.args = {
  ...Input.args,
  type: 'password',
  placeholder: 'Placeholder',
  value: '%5sdad@dfsa45W',
  icon: false,
  prefix: '',
  suffix: '',
  optional: false,
  hint: '',
};

export const NumberInput = Template.bind({});
NumberInput.args = {
  ...Input.args,
  type: 'number',
  value: '1',
  icon: false,
  prefix: '',
  suffix: '',
  optional: false,
  hint: '',
  min: 0,
  max: 10,
  step: 1,
};
