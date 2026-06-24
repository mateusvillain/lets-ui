import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/Input',
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'number'],
      table: { defaultValue: { summary: 'text' } },
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm'],
      table: { defaultValue: { summary: 'lg' } },
    },
    name: {
      control: 'text',
    },
    form: {
      control: 'text',
    },
    required: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    optional: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    optionalText: {
      control: 'text',
    },
    maxlength: {
      control: 'number',
    },
    hint: {
      control: 'text',
    },
    error: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    errorText: {
      control: 'text',
    },
    prefix: {
      control: 'text',
    },
    suffix: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    min: {
      control: 'number',
    },
    max: {
      control: 'number',
    },
    step: {
      control: 'number',
    },
  },
};

const Template = ({
  type,
  label,
  placeholder,
  value,
  size,
  name,
  form,
  required,
  optional,
  optionalText,
  maxlength,
  hint,
  error,
  errorText,
  prefix,
  suffix,
  disabled,
  min,
  max,
  step,
}) => {
  const attrs = [
    `type="${type ?? 'text'}"`,
    `label="${label ?? ''}"`,
    `placeholder="${placeholder ?? ''}"`,
    `value="${value ?? ''}"`,
    `size="${size ?? 'lg'}"`,
    name ? `name="${name}"` : '',
    form ? `form="${form}"` : '',
    required ? 'required' : '',
    optional ? 'optional' : '',
    optionalText ? `optional-text="${optionalText}"` : '',
    Number.isFinite(Number(maxlength))
      ? `maxlength="${Number(maxlength)}"`
      : '',
    hint ? `hint="${hint}"` : '',
    error ? 'error' : '',
    errorText ? `error-text="${errorText}"` : '',
    prefix ? `prefix="${prefix}"` : '',
    suffix ? `suffix="${suffix}"` : '',
    disabled ? 'disabled' : '',
    Number.isFinite(Number(min)) ? `min="${Number(min)}"` : '',
    Number.isFinite(Number(max)) ? `max="${Number(max)}"` : '',
    Number.isFinite(Number(step)) ? `step="${Number(step)}"` : '',
  ]
    .filter(Boolean)
    .join('\n  ');

  return `<lui-input\n  ${attrs}\n >\n </lui-input>`;
};

export const Input = Template.bind({});
Input.args = {
  type: 'text',
  label: 'Label',
  placeholder: 'Placeholder',
  value: '',
  size: 'lg',
  name: '',
  form: '',
  required: false,
  optional: true,
  optionalText: '(opcional)',
  maxlength: 100,
  hint: 'Hint text',
  error: false,
  errorText: 'Campo obrigatório.',
  prefix: 'www.',
  suffix: '.com',
  disabled: false,
  min: undefined,
  max: undefined,
  step: undefined,
};

export const Error = () => `
  <div style="width: 244px;">
    <lui-input
      label="Label"
      placeholder="Placeholder"
      size="lg"
      error
      error-text="Campo obrigatório."
    ></lui-input>
  </div>
`;

export const Disabled = () => `
  <div style="width: 244px;">
    <lui-input
      label="Label"
      placeholder="Placeholder"
      value="Value"
      size="lg"
      disabled
    ></lui-input>
  </div>
`;

export const Password = () => `
  <div style="width: 244px;">
    <lui-input
      type="password"
      label="Senha"
      placeholder="Digite sua senha"
      value="%5sdad@dfsa45W"
      size="lg"
    ></lui-input>
  </div>
`;

export const NumberInput = () => `
  <div style="width: 244px;">
    <lui-input
      type="number"
      label="Quantidade"
      size="lg"
      value="1"
      min="0"
      max="10"
      step="1"
    ></lui-input>
  </div>
`;

export const Required = () => `
  <div style="width: 244px;">
    <lui-input
      name="email"
      label="E-mail"
      placeholder="seu@email.com"
      required
      size="lg"
      hint="Campo obrigatório."
      error-text="E-mail é obrigatório."
    ></lui-input>
  </div>
`;
Required.parameters = {
  docs: {
    description: {
      story:
        'Com `required`, o campo bloqueia a submissão do form quando vazio e reporta o erro via `ElementInternals.setValidity()`. A mensagem de erro exibida é controlada pelo atributo `error-text`.',
    },
  },
};

export const FormIntegration = () => {
  const container = document.createElement('div');
  container.style.cssText =
    'max-width: 360px; display: flex; flex-direction: column; gap: 24px;';
  container.innerHTML = `
    <form id="input-demo-form" style="display: flex; flex-direction: column; gap: 16px;">
      <lui-input
        name="name"
        label="Nome"
        placeholder="Digite seu nome"
        required
        size="lg"
        error-text="Nome é obrigatório."
      ></lui-input>
      <lui-input
        name="email"
        label="E-mail"
        placeholder="seu@email.com"
        required
        size="lg"
        error-text="E-mail é obrigatório."
      ></lui-input>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <lui-button type="reset" variant="secondary" size="md">Limpar</lui-button>
        <lui-button type="submit" variant="primary" size="md">Cadastrar</lui-button>
      </div>
    </form>
    <p id="input-demo-feedback" style="font-size: 13px; min-height: 18px;"></p>
  `;

  const form = container.querySelector('#input-demo-form');
  const feedback = container.querySelector('#input-demo-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    feedback.style.color = 'green';
    feedback.textContent = `✓ Cadastrado: ${data.get('name')} <${data.get('email')}>`;
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
        'Demonstração completa com `lui-input` e `lui-button` integrados ao mesmo form. Os valores de `name` e `e-mail` são capturados via `FormData`. Campos `required` bloqueiam a submissão quando vazios.',
    },
  },
};

export const CSSClass = () => `
  <div class="input-field input-field--lg">
    <div class="input-field__head">
      <div class="input-field__label-wrap">
        <label class="input-field__label">Email</label>
      </div>
    </div>
    <div class="input-field__control">
      <input type="email" class="input-field__input" placeholder="seu@email.com">
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
