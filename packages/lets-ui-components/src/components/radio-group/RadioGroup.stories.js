import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/Radio/Radio Group',
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    hint: { control: 'text' },
    'error-text': { control: 'text' },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
      table: { defaultValue: { summary: 'lg' } },
    },
    required: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

const Template = ({
  label,
  name,
  size,
  hint,
  required,
  disabled,
  error,
  'error-text': errorText,
}) => {
  const attrs = [
    `name="${name ?? 'group'}"`,
    `size="${size ?? 'lg'}"`,
    label ? `label="${label}"` : '',
    hint ? `hint="${hint}"` : '',
    errorText ? `error-text="${errorText}"` : '',
    required ? 'required' : '',
    disabled ? 'disabled' : '',
    error ? 'error' : '',
  ]
    .filter(Boolean)
    .join('\n  ');

  return `
<lui-radio-group
  ${attrs}
>
  <lui-radio value="opt1" label="Opção 1"></lui-radio>
  <lui-radio value="opt2" label="Opção 2"></lui-radio>
  <lui-radio value="opt3" label="Opção 3"></lui-radio>
</lui-radio-group>`;
};

export const RadioGroup = Template.bind({});
RadioGroup.args = {
  label: 'Escolha uma opção',
  name: 'story-group',
  size: 'lg',
  hint: '',
  required: false,
  disabled: false,
  error: false,
  'error-text': 'Selecione uma opção.',
};

export const WithHint = () => `
<lui-radio-group
  name="plan"
  label="Plano"
  hint="Você pode alterar o plano a qualquer momento."
>
  <lui-radio value="free" label="Free — até 3 projetos"></lui-radio>
  <lui-radio value="pro" label="Pro — projetos ilimitados"></lui-radio>
  <lui-radio value="enterprise" label="Enterprise — sob consulta"></lui-radio>
</lui-radio-group>`;
WithHint.storyName = 'With Hint';
WithHint.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'O `hint` aparece abaixo das opções em cor `caption`. Quando o evento `invalid` dispara e `error` passa a `true`, o hint é substituído pela mensagem de `error-text`.',
    },
  },
};

export const Small = () => `
<lui-radio-group name="plan" label="Plano" size="md">
  <lui-radio value="free" label="Free"></lui-radio>
  <lui-radio value="pro" label="Pro"></lui-radio>
  <lui-radio value="enterprise" label="Enterprise" disabled></lui-radio>
</lui-radio-group>`;
Small.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'Tamanho `md`: a label do grupo usa `body--md`, o mesmo padrão do `lui-input` em tamanho médio.',
    },
  },
};

export const PreSelected = () => `
<lui-radio-group name="plan" label="Plano">
  <lui-radio value="free" label="Free — até 3 projetos"></lui-radio>
  <lui-radio value="pro" label="Pro — projetos ilimitados" checked></lui-radio>
  <lui-radio value="enterprise" label="Enterprise — sob consulta"></lui-radio>
</lui-radio-group>`;
PreSelected.storyName = 'Pre-selected';
PreSelected.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'Para definir um valor inicial, adicione `checked` ao `lui-radio` desejado. O grupo lê o estado dos filhos ao conectar e sincroniza o `FormData` automaticamente.',
    },
  },
};

export const Disabled = () => `
<lui-radio-group name="plan" label="Plano" disabled>
  <lui-radio value="free" label="Free"></lui-radio>
  <lui-radio value="pro" label="Pro" checked></lui-radio>
  <lui-radio value="enterprise" label="Enterprise"></lui-radio>
</lui-radio-group>`;
Disabled.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        '`disabled` no grupo propaga o estado para todos os filhos e impede a submissão do campo.',
    },
  },
};

export const Required = () => `
<form id="rg-required-form" style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
  <lui-radio-group
    name="plan"
    label="Plano"
    required
    error-text="Selecione um plano para continuar."
  >
    <lui-radio value="free" label="Free — até 3 projetos"></lui-radio>
    <lui-radio value="pro" label="Pro — projetos ilimitados"></lui-radio>
    <lui-radio value="enterprise" label="Enterprise — sob consulta"></lui-radio>
  </lui-radio-group>
  <div style="display: flex; justify-content: flex-end;">
    <lui-button type="submit" variant="primary">Continuar</lui-button>
  </div>
</form>`;
Required.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        '`required` no grupo bloqueia a submissão quando nenhum radio está selecionado. Ao tentar submeter, o evento `invalid` dispara no grupo e a mensagem de `error-text` é exibida abaixo das opções.',
    },
  },
};

export const FormIntegration = () => {
  const container = document.createElement('div');
  container.style.cssText =
    'max-width: 400px; display: flex; flex-direction: column; gap: 24px;';
  container.innerHTML = `
    <form id="rg-demo-form" style="display: flex; flex-direction: column; gap: 20px;">
      <lui-radio-group
        name="plan"
        label="Plano"
        required
        error-text="Selecione um plano."
      >
        <lui-radio value="free" label="Free — até 3 projetos"></lui-radio>
        <lui-radio value="pro" label="Pro — projetos ilimitados"></lui-radio>
        <lui-radio value="enterprise" label="Enterprise — sob consulta"></lui-radio>
      </lui-radio-group>
      <lui-radio-group
        name="billing"
        label="Ciclo de cobrança"
        required
        error-text="Selecione o ciclo de cobrança."
      >
        <lui-radio value="monthly" label="Mensal"></lui-radio>
        <lui-radio value="yearly" label="Anual (2 meses grátis)"></lui-radio>
      </lui-radio-group>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <lui-button type="reset" variant="secondary">Limpar</lui-button>
        <lui-button type="submit" variant="primary">Confirmar</lui-button>
      </div>
    </form>
    <p id="rg-demo-feedback" style="font-size: 13px; min-height: 18px;"></p>
  `;

  const form = container.querySelector('#rg-demo-form');
  const feedback = container.querySelector('#rg-demo-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    feedback.style.color = 'green';
    feedback.textContent = `✓ plan: "${data.get('plan')}"  billing: "${data.get('billing')}"`;
  });

  form.addEventListener('reset', () => {
    feedback.textContent = '';
  });

  return container;
};
FormIntegration.storyName = 'Form Integration';
FormIntegration.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'O `lui-radio-group` é form-associated: o `value` do radio selecionado é submetido no `FormData` com a chave `name` do grupo. Reset limpa todos os filhos e restaura a validade.',
    },
  },
};

export const CSSClass = () => `
  <fieldset class="radio-group radio-group--lg">
    <legend class="radio-group__legend">Plano</legend>
    <div class="radio-group__options">
      <label class="radio">
        <input type="radio" name="plano" value="basic"> Básico
      </label>
      <label class="radio">
        <input type="radio" name="plano" value="pro"> Pro
      </label>
    </div>
  </fieldset>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
