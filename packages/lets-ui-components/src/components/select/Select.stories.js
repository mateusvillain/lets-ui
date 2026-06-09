import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/Native Select',
  argTypes: {
    label: { control: 'text' },
    placeholder: {
      control: 'text',
      table: { defaultValue: { summary: 'Select an option' } },
    },
    options: {
      control: 'text',
      table: { defaultValue: { summary: 'Option 1,Option 2,Option 3' } },
    },
    selected: { control: 'number', table: { defaultValue: { summary: '0' } } },
    name: { control: 'text' },
    form: { control: 'text' },
    required: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    optional: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    optionalText: { control: 'text' },
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
    size: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm'],
      table: { defaultValue: { summary: 'lg' } },
    },
  },
};

const Template = ({
  label,
  placeholder,
  options,
  selected,
  name,
  form,
  required,
  optional,
  optionalText,
  hint,
  error,
  errorText,
  disabled,
  size,
}) => {
  const attrs = [
    `label="${label ?? ''}"`,
    `placeholder="${placeholder ?? ''}"`,
    `options="${options ?? ''}"`,
    Number.isFinite(Number(selected)) ? `selected="${Number(selected)}"` : '',
    `size="${size ?? 'lg'}"`,
    name ? `name="${name}"` : '',
    form ? `form="${form}"` : '',
    required ? 'required' : '',
    optional ? 'optional' : '',
    optionalText ? `optional-text="${optionalText}"` : '',
    hint ? `hint="${hint}"` : '',
    error ? 'error' : '',
    errorText ? `error-text="${errorText}"` : '',
    disabled ? 'disabled' : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  return `<div style="width: 244px;">\n  <lui-native-select\n    ${attrs}\n  ></lui-native-select>\n</div>`;
};

export const NativeSelect = Template.bind({});
NativeSelect.args = {
  label: 'Label',
  placeholder: 'Select an option',
  options: 'Option 1,Option 2,Option 3',
  selected: 1,
  name: '',
  form: '',
  required: false,
  optional: true,
  optionalText: '(opcional)',
  hint: 'Hint text',
  error: false,
  errorText: 'Campo obrigatório.',
  disabled: false,
  size: 'lg',
};

export const Error = () => `
  <div style="width: 244px;">
    <lui-native-select
      label="Label"
      options="Option 1,Option 2,Option 3"
      selected="0"
      size="lg"
      error
      error-text="Campo obrigatório."
    ></lui-native-select>
  </div>
`;

export const Disabled = () => `
  <div style="width: 244px;">
    <lui-native-select
      label="Label"
      options="Option 1,Option 2,Option 3"
      selected="1"
      size="lg"
      disabled
    ></lui-native-select>
  </div>
`;

export const Required = () => `
  <div style="width: 244px;">
    <lui-native-select
      name="category"
      label="Categoria"
      placeholder="Selecione uma categoria"
      options="Design,Engenharia,Produto"
      size="lg"
      required
      error-text="Selecione uma categoria."
    ></lui-native-select>
  </div>
`;
Required.parameters = {
  docs: {
    description: {
      story:
        'Com `required`, o form não submete enquanto o placeholder estiver selecionado (nenhuma opção real escolhida).',
    },
  },
};

export const FormIntegration = () => {
  const container = document.createElement('div');
  container.style.cssText =
    'max-width: 360px; display: flex; flex-direction: column; gap: 24px;';
  container.innerHTML = `
    <form id="select-demo-form" style="display: flex; flex-direction: column; gap: 16px;">
      <lui-native-select
        name="role"
        label="Função"
        placeholder="Selecione sua função"
        options="Design,Engenharia,Produto,Marketing"
        size="lg"
        required
        error-text="Selecione uma função."
      ></lui-native-select>
      <lui-native-select
        name="seniority"
        label="Senioridade"
        placeholder="Selecione a senioridade"
        options="Júnior,Pleno,Sênior,Staff"
        size="lg"
        required
        error-text="Selecione a senioridade."
      ></lui-native-select>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <lui-button type="reset" variant="secondary" size="md">Limpar</lui-button>
        <lui-button type="submit" variant="primary" size="md">Salvar</lui-button>
      </div>
    </form>
    <p id="select-demo-feedback" style="font-size: 13px; min-height: 18px;"></p>
  `;

  const form = container.querySelector('#select-demo-form');
  const feedback = container.querySelector('#select-demo-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    feedback.style.color = 'green';
    feedback.textContent = `✓ ${data.get('role')} · ${data.get('seniority')}`;
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
        'O valor da opção selecionada é submetido via `FormData` com a chave `name`. `required` bloqueia a submissão enquanto o placeholder estiver ativo.',
    },
  },
};

export const CSSClass = () => `
  <div class="native-select native-select--lg">
    <div class="native-select__head">
      <label class="native-select__label">País</label>
    </div>
    <div class="native-select__control">
      <select class="native-select__input">
        <option value="">Selecione...</option>
        <option value="br">Brasil</option>
      </select>
      <span class="native-select__arrow">
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.2197 8.46973C18.5126 8.17683 18.9874 8.17683 19.2803 8.46973C19.5732 8.76262 19.5732 9.23738 19.2803 9.53027L12.5303 16.2803C12.2374 16.5732 11.7626 16.5732 11.4697 16.2803L4.71973 9.53027C4.42684 9.23738 4.42684 8.76262 4.71973 8.46973C5.01262 8.17683 5.48738 8.17683 5.78028 8.46973L12 14.6895L18.2197 8.46973Z"/>
        </svg>
      </span>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
