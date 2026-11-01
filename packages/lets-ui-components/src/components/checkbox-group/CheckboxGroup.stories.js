import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/Checkbox/Checkbox Group',
  // Fail the story test on any axe violation, not just report it.
  parameters: { a11y: { test: 'error' } },
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
<lui-checkbox-group
  ${attrs}
>
  <lui-checkbox value="opt1" label="Opção 1"></lui-checkbox>
  <lui-checkbox value="opt2" label="Opção 2"></lui-checkbox>
  <lui-checkbox value="opt3" label="Opção 3"></lui-checkbox>
</lui-checkbox-group>`;
};

export const CheckboxGroup = Template.bind({});
CheckboxGroup.args = {
  label: 'Escolha as opções',
  name: 'story-group',
  size: 'lg',
  hint: '',
  required: false,
  disabled: false,
  error: false,
  'error-text': 'Selecione pelo menos uma opção.',
};

export const WithHint = () => `
<lui-checkbox-group
  name="channels"
  label="Notificações"
  hint="Escolha por onde quer receber os avisos."
>
  <lui-checkbox value="email" label="E-mail"></lui-checkbox>
  <lui-checkbox value="sms" label="SMS"></lui-checkbox>
  <lui-checkbox value="push" label="Push"></lui-checkbox>
</lui-checkbox-group>`;
WithHint.storyName = 'With Hint';
WithHint.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'O `hint` aparece entre o título e as opções, em cor `caption`, e descreve o grupo para leitores de tela.',
    },
  },
};

export const ErrorState = () => `
<lui-checkbox-group
  name="channels"
  label="Notificações"
  hint="Escolha por onde quer receber os avisos."
  error
  error-text="Selecione pelo menos um canal."
>
  <lui-checkbox value="email" label="E-mail"></lui-checkbox>
  <lui-checkbox value="sms" label="SMS"></lui-checkbox>
  <lui-checkbox value="push" label="Push"></lui-checkbox>
</lui-checkbox-group>`;
ErrorState.storyName = 'Error';
ErrorState.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'Com `error`, a mensagem de `error-text` aparece uma única vez, abaixo das opções, e cada checkbox recebe só o estilo de erro. O hint continua visível.',
    },
  },
};

export const Small = () => `
<lui-checkbox-group name="channels" label="Notificações" size="md">
  <lui-checkbox value="email" label="E-mail"></lui-checkbox>
  <lui-checkbox value="sms" label="SMS"></lui-checkbox>
  <lui-checkbox value="push" label="Push" disabled></lui-checkbox>
</lui-checkbox-group>`;
Small.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'Tamanho `md`: a label do grupo usa `body--md` e cada checkbox recebe `size="md"`.',
    },
  },
};

export const PreSelected = () => `
<lui-checkbox-group name="channels" label="Notificações">
  <lui-checkbox value="email" label="E-mail" checked></lui-checkbox>
  <lui-checkbox value="sms" label="SMS"></lui-checkbox>
  <lui-checkbox value="push" label="Push" checked></lui-checkbox>
</lui-checkbox-group>`;
PreSelected.storyName = 'Pre-selected';
PreSelected.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        'Para definir valores iniciais, adicione `checked` aos `lui-checkbox` desejados.',
    },
  },
};

export const Disabled = () => `
<lui-checkbox-group name="channels" label="Notificações" disabled>
  <lui-checkbox value="email" label="E-mail" checked></lui-checkbox>
  <lui-checkbox value="sms" label="SMS"></lui-checkbox>
  <lui-checkbox value="push" label="Push"></lui-checkbox>
</lui-checkbox-group>`;
Disabled.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        '`disabled` no grupo desabilita todos os filhos e tira os valores da submissão. Ao remover o atributo, só voltam os checkboxes que o grupo desabilitou.',
    },
  },
};

export const Required = () => `
<form style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
  <lui-checkbox-group
    name="channels"
    label="Notificações"
    required
    error-text="Selecione pelo menos um canal para continuar."
  >
    <lui-checkbox value="email" label="E-mail"></lui-checkbox>
    <lui-checkbox value="sms" label="SMS"></lui-checkbox>
    <lui-checkbox value="push" label="Push"></lui-checkbox>
  </lui-checkbox-group>
  <div style="display: flex; justify-content: flex-end;">
    <lui-button type="submit" variant="primary">Continuar</lui-button>
  </div>
</form>`;
Required.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        '`required` no grupo exige pelo menos uma opção marcada. Ao tentar submeter sem nenhuma, o evento `invalid` dispara no grupo e a mensagem de `error-text` aparece abaixo das opções. Ela some assim que uma opção é marcada.',
    },
  },
};

export const FormIntegration = () => {
  const container = document.createElement('div');
  container.style.cssText =
    'max-width: 400px; display: flex; flex-direction: column; gap: 24px;';
  container.innerHTML = `
    <form style="display: flex; flex-direction: column; gap: 20px;">
      <lui-checkbox-group
        name="channels"
        label="Notificações"
        required
        error-text="Selecione pelo menos um canal."
      >
        <lui-checkbox value="email" label="E-mail"></lui-checkbox>
        <lui-checkbox value="sms" label="SMS"></lui-checkbox>
        <lui-checkbox value="push" label="Push"></lui-checkbox>
      </lui-checkbox-group>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <lui-button type="reset" variant="secondary">Limpar</lui-button>
        <lui-button type="submit" variant="primary">Confirmar</lui-button>
      </div>
    </form>
    <p data-feedback style="font-size: 13px; min-height: 18px;"></p>
  `;

  const form = container.querySelector('form');
  const feedback = container.querySelector('[data-feedback]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const channels = new FormData(e.target).getAll('channels');
    feedback.style.color = 'green';
    feedback.textContent = `✓ channels: ${JSON.stringify(channels)}`;
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
        'Cada opção marcada entra no `FormData` com a chave `name` do grupo, como num grupo de checkboxes nativo: use `getAll()` para ler a lista. Reset desmarca todas e limpa o erro.',
    },
  },
};

export const CSSClass = () => `
  <fieldset class="checkbox-group checkbox-group--lg">
    <legend class="checkbox-group__legend">Notificações</legend>
    <p class="checkbox-group__hint">Escolha por onde quer receber os avisos.</p>
    <div class="checkbox-group__options">
      <label class="checkbox checkbox--lg">
        <input type="checkbox" name="channels" value="email"> E-mail
      </label>
      <label class="checkbox checkbox--lg">
        <input type="checkbox" name="channels" value="sms"> SMS
      </label>
    </div>
  </fieldset>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
