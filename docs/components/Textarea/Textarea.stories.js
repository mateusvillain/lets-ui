import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Form and options/Textarea',
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm'],
    },
    rows: { control: 'number' },
    resize: {
      control: { type: 'select' },
      options: ['vertical', 'none', 'both'],
    },
    optional: { control: 'boolean' },
    optionalText: { control: 'text' },
    maxlength: { control: 'number' },
    hint: { control: 'text' },
    error: { control: 'boolean' },
    errorText: { control: 'text' },
    disabled: { control: 'boolean' },
    forceState: {
      control: { type: 'select' },
      options: ['', 'hovered', 'focused'],
    },
  },
};

const Template = ({
  label,
  placeholder,
  value,
  size,
  rows,
  resize,
  optional,
  optionalText,
  maxlength,
  hint,
  error,
  errorText,
  disabled,
  forceState,
}) => {
  const attrs = [
    `label="${label ?? ''}"`,
    `placeholder="${placeholder ?? ''}"`,
    value ? `value="${value}"` : '',
    `size="${size ?? 'lg'}"`,
    rows ? `rows="${rows}"` : '',
    resize && resize !== 'vertical' ? `resize="${resize}"` : '',
    optional ? 'optional' : '',
    optionalText ? `optional-text="${optionalText}"` : '',
    Number.isFinite(Number(maxlength)) && maxlength
      ? `maxlength="${Number(maxlength)}"`
      : '',
    hint ? `hint="${hint}"` : '',
    error ? 'error' : '',
    errorText ? `error-text="${errorText}"` : '',
    disabled ? 'disabled' : '',
    forceState ? `force-state="${forceState}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <div style="width: 320px;">
      <lui-textarea ${attrs}></lui-textarea>
    </div>
  `;
};

export const Textarea = Template.bind({});
Textarea.args = {
  label: 'Label',
  placeholder: 'Placeholder',
  value: '',
  size: 'lg',
  rows: 4,
  resize: 'vertical',
  optional: true,
  optionalText: '(opcional)',
  maxlength: 200,
  hint: 'Hint text',
  error: false,
  errorText: 'Campo obrigatório.',
  disabled: false,
  forceState: '',
};

export const WithCounter = Template.bind({});
WithCounter.args = {
  ...Textarea.args,
  label: 'Descrição',
  placeholder: 'Escreva uma descrição...',
  maxlength: 200,
  hint: '',
  optional: false,
};

export const Error = Template.bind({});
Error.args = {
  ...Textarea.args,
  label: 'Observações',
  placeholder: 'Escreva suas observações...',
  hint: '',
  error: true,
  optional: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Textarea.args,
  label: 'Comentário',
  value: 'Conteúdo somente leitura.',
  hint: '',
  optional: false,
  disabled: true,
};

export const NoResize = Template.bind({});
NoResize.args = {
  ...Textarea.args,
  label: 'Mensagem',
  placeholder: 'Sua mensagem...',
  resize: 'none',
  hint: 'Tamanho fixo.',
  optional: false,
};
NoResize.storyName = 'Resize: None';
