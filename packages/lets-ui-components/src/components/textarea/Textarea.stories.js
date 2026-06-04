import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/Textarea',
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm'],
      table: { defaultValue: { summary: 'lg' } },
    },
    name: { control: 'text' },
    form: { control: 'text' },
    required: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    rows: { control: 'number', table: { defaultValue: { summary: '4' } } },
    resize: {
      control: { type: 'select' },
      options: ['vertical', 'none', 'both'],
      table: { defaultValue: { summary: 'vertical' } },
    },
    optional: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    optionalText: { control: 'text' },
    maxlength: { control: 'number' },
    hint: { control: 'text' },
    error: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    errorText: { control: 'text' },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

const Template = ({
  label,
  placeholder,
  value,
  size,
  name,
  form,
  required,
  rows,
  resize,
  optional,
  optionalText,
  maxlength,
  hint,
  error,
  errorText,
  disabled,
}) => {
  const attrs = [
    `label="${label ?? ''}"`,
    `placeholder="${placeholder ?? ''}"`,
    value ? `value="${value}"` : '',
    `size="${size ?? 'lg'}"`,
    name ? `name="${name}"` : '',
    form ? `form="${form}"` : '',
    required ? 'required' : '',
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
  ]
    .filter(Boolean)
    .join('\n    ');

  return `<div style="width: 320px;">\n  <lui-textarea\n    ${attrs}\n  ></lui-textarea>\n</div>`;
};

export const Textarea = Template.bind({});
Textarea.args = {
  label: 'Label',
  placeholder: 'Placeholder',
  value: '',
  size: 'lg',
  name: '',
  form: '',
  required: false,
  rows: 4,
  resize: 'vertical',
  optional: true,
  optionalText: '(opcional)',
  maxlength: 200,
  hint: 'Hint text',
  error: false,
  errorText: 'Campo obrigatório.',
  disabled: false,
};

export const WithCounter = () => `
  <div style="width: 320px;">
    <lui-textarea
      label="Descrição"
      placeholder="Escreva uma descrição..."
      size="lg"
      maxlength="200"
    ></lui-textarea>
  </div>
`;
WithCounter.storyName = 'With Counter';

export const Error = () => `
  <div style="width: 320px;">
    <lui-textarea
      label="Observações"
      placeholder="Escreva suas observações..."
      size="lg"
      error
      error-text="Campo obrigatório."
    ></lui-textarea>
  </div>
`;

export const Disabled = () => `
  <div style="width: 320px;">
    <lui-textarea
      label="Comentário"
      value="Conteúdo somente leitura."
      size="lg"
      disabled
    ></lui-textarea>
  </div>
`;

export const NoResize = () => `
  <div style="width: 320px;">
    <lui-textarea
      label="Mensagem"
      placeholder="Sua mensagem..."
      size="lg"
      resize="none"
      hint="Tamanho fixo."
    ></lui-textarea>
  </div>
`;
NoResize.storyName = 'Resize: None';

export const Required = () => `
  <div style="width: 320px;">
    <lui-textarea
      name="message"
      label="Mensagem"
      placeholder="Escreva sua mensagem..."
      size="lg"
      required
      hint="Campo obrigatório."
      error-text="Mensagem é obrigatória."
    ></lui-textarea>
  </div>
`;
Required.parameters = {
  docs: {
    description: {
      story:
        'Com `required`, o campo bloqueia a submissão do form quando vazio via `ElementInternals.setValidity()`.',
    },
  },
};

export const FormIntegration = () => {
  const container = document.createElement('div');
  container.style.cssText =
    'max-width: 360px; display: flex; flex-direction: column; gap: 24px;';
  container.innerHTML = `
    <form id="textarea-demo-form" style="display: flex; flex-direction: column; gap: 16px;">
      <lui-textarea
        name="message"
        label="Mensagem"
        placeholder="Escreva sua mensagem..."
        size="lg"
        required
        maxlength="300"
        error-text="Mensagem é obrigatória."
      ></lui-textarea>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <lui-button type="reset" variant="secondary" size="md">Limpar</lui-button>
        <lui-button type="submit" variant="primary" size="md">Enviar</lui-button>
      </div>
    </form>
    <p id="textarea-demo-feedback" style="font-size: 13px; min-height: 18px;"></p>
  `;

  const form = container.querySelector('#textarea-demo-form');
  const feedback = container.querySelector('#textarea-demo-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    feedback.style.color = 'green';
    feedback.textContent = `✓ Enviado: "${data.get('message')}"`;
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
        'O `lui-textarea` é form-associated — seu valor é capturado via `FormData` através do atributo `name`. `required` bloqueia a submissão quando o campo está vazio.',
    },
  },
};
