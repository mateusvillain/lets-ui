import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/Checkbox',
  argTypes: {
    label: { control: 'text' },
    name: { control: 'text' },
    value: { control: 'text', table: { defaultValue: { summary: 'on' } } },
    form: { control: 'text' },
    checked: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
      table: { defaultValue: { summary: 'lg' } },
    },
  },
};

const Template = ({
  label,
  name,
  value,
  form,
  checked,
  disabled,
  required,
  size,
}) => {
  const attrs = [
    `size="${size ?? 'lg'}"`,
    name ? `name="${name}"` : '',
    value && value !== 'on' ? `value="${value}"` : '',
    form ? `form="${form}"` : '',
    checked ? 'checked' : '',
    disabled ? 'disabled' : '',
    required ? 'required' : '',
  ]
    .filter(Boolean)
    .join('\n  ');

  return `<lui-checkbox\n  ${attrs}\n>\n  ${label ?? ''}\n</lui-checkbox>`;
};

export const Checkbox = Template.bind({});
Checkbox.args = {
  label: 'Checkbox label',
  name: '',
  value: 'on',
  form: '',
  checked: false,
  disabled: false,
  required: false,
  size: 'lg',
};

export const LabelAttribute = () =>
  `<lui-checkbox label="Opção via atributo" size="lg"></lui-checkbox>`;
LabelAttribute.storyName = 'Label (atributo)';
LabelAttribute.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'Fallback para texto simples: o atributo `label` é renderizado como conteúdo padrão do slot quando nenhum conteúdo é projetado.',
    },
  },
};

export const Checked = () =>
  `<lui-checkbox checked size="lg">Opção selecionada</lui-checkbox>`;

export const Small = () => `<lui-checkbox size="md">Label</lui-checkbox>`;

export const Disabled = () =>
  `<lui-checkbox checked disabled size="lg">Desabilitado</lui-checkbox>`;

export const Required = () => `
  <form id="checkbox-required-form" style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
    <lui-checkbox name="terms" value="accepted" required size="lg">
      Li e aceito os termos de uso
    </lui-checkbox>
    <lui-button type="submit" variant="primary" size="md">Continuar</lui-button>
  </form>
`;
Required.parameters = {
  docs: {
    description: {
      story:
        'Com `required`, o form não submete enquanto o checkbox não estiver marcado.',
    },
  },
};

export const FormIntegration = () => {
  const container = document.createElement('div');
  container.style.cssText =
    'max-width: 360px; display: flex; flex-direction: column; gap: 24px;';
  container.innerHTML = `
    <form id="checkbox-demo-form" style="display: flex; flex-direction: column; gap: 16px;">
      <lui-checkbox name="newsletter" value="subscribed" size="lg">
        Quero receber novidades por e-mail
      </lui-checkbox>
      <lui-checkbox name="terms" value="accepted" required size="lg">
        Li e aceito os termos de uso
      </lui-checkbox>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <lui-button type="reset" variant="secondary" size="md">Limpar</lui-button>
        <lui-button type="submit" variant="primary" size="md">Cadastrar</lui-button>
      </div>
    </form>
    <p id="checkbox-demo-feedback" style="font-size: 13px; min-height: 18px;"></p>
  `;

  const form = container.querySelector('#checkbox-demo-form');
  const feedback = container.querySelector('#checkbox-demo-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const newsletter = data.get('newsletter') ? 'sim' : 'não';
    feedback.style.color = 'green';
    feedback.textContent = `✓ Cadastrado. Newsletter: ${newsletter}`;
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
        'Quando marcado, submete `value` no `FormData` com a chave `name`. Quando desmarcado, o campo é omitido — comportamento idêntico ao `<input type="checkbox">` nativo. O campo `terms` é `required`.',
    },
  },
};
