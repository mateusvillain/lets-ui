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
    pattern: {
      control: 'text',
    },
    inputmode: {
      control: { type: 'select' },
      options: [
        '',
        'text',
        'numeric',
        'decimal',
        'tel',
        'email',
        'url',
        'search',
        'none',
      ],
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
  pattern,
  inputmode,
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
    pattern ? `pattern="${pattern}"` : '',
    inputmode ? `inputmode="${inputmode}"` : '',
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
  pattern: '',
  inputmode: '',
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

export const Pattern = () => `
  <div style="width: 244px;">
    <lui-input
      name="cep"
      label="CEP"
      placeholder="00000-000"
      pattern="[0-9]{5}-?[0-9]{3}"
      size="lg"
      hint="Formato: 00000-000"
      error-text="CEP inválido. Use o formato 00000-000."
    ></lui-input>
  </div>
`;
Pattern.parameters = {
  docs: {
    description: {
      story:
        'Com `pattern`, o campo é validado por regex (via Constraint Validation API). Quando o valor não casa com o padrão, o campo reporta `patternMismatch` através de `ElementInternals.setValidity()`, exibindo a mensagem de `error-text`.',
    },
  },
};

export const InputMode = () => `
  <div style="width: 244px; display: flex; flex-direction: column; gap: 16px;">
    <lui-input
      name="phone"
      label="Telefone"
      placeholder="(00) 00000-0000"
      inputmode="tel"
      size="lg"
    ></lui-input>
    <lui-input
      name="email"
      label="E-mail"
      placeholder="seu@email.com"
      inputmode="email"
      size="lg"
    ></lui-input>
  </div>
`;
InputMode.storyName = 'Input Mode';
InputMode.parameters = {
  docs: {
    description: {
      story:
        'Com `inputmode`, o teclado virtual exibido em dispositivos touch é otimizado para o tipo de dado esperado (ex.: `tel`, `email`, `numeric`), sem alterar o tipo nativo do campo.',
    },
  },
};

export const PatternAndInputMode = () => `
  <div style="width: 244px;">
    <lui-input
      name="cpf"
      label="CPF"
      placeholder="000.000.000-00"
      pattern="[0-9]{3}\\.?[0-9]{3}\\.?[0-9]{3}-?[0-9]{2}"
      inputmode="numeric"
      size="lg"
      hint="Formato: 000.000.000-00"
      error-text="CPF inválido."
    ></lui-input>
  </div>
`;
PatternAndInputMode.storyName = 'Pattern + Input Mode';
PatternAndInputMode.parameters = {
  docs: {
    description: {
      story:
        'Combinando `pattern` e `inputmode`: o teclado numérico é exibido em dispositivos touch e o valor final é validado pela regex, útil para campos como CPF/CNPJ sem máscara.',
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
