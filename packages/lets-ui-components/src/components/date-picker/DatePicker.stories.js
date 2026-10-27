import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/Date Picker',
  argTypes: {
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
      description:
        'Vazio usa o padrão: `Select a date`, ou o `format-text` com `editable`',
      table: { defaultValue: { summary: 'Select a date' } },
    },
    editable: {
      control: 'boolean',
      description: 'Permite digitar a data, com máscara no formato do locale',
      table: { defaultValue: { summary: 'false' } },
    },
    range: {
      control: 'boolean',
      description: 'Seleciona um intervalo em vez de uma data',
      table: { defaultValue: { summary: 'false' } },
    },
    value: {
      control: 'text',
      description:
        'Data em ISO 8601 (`YYYY-MM-DD`); com `range`, intervalo `YYYY-MM-DD/YYYY-MM-DD`',
    },
    min: {
      control: 'text',
      description: 'Primeira data selecionável (`YYYY-MM-DD`)',
    },
    max: {
      control: 'text',
      description: 'Última data selecionável (`YYYY-MM-DD`)',
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
      table: { defaultValue: { summary: 'lg' } },
    },
    locale: {
      control: 'text',
      table: { defaultValue: { summary: 'en-US' } },
    },
    firstDayOfWeek: {
      control: { type: 'select' },
      options: [0, 1, 2, 3, 4, 5, 6],
      description: '0 = domingo, 1 = segunda-feira…',
      table: { defaultValue: { summary: '0' } },
    },
    name: {
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
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    optionalText: {
      control: 'text',
      description: 'Marcador exibido ao lado do rótulo com `optional`',
      table: { category: 'Textos', defaultValue: { summary: '(optional)' } },
    },
    badInputText: {
      control: 'text',
      description:
        'Mensagem de erro, com `editable`, quando o texto não forma uma data',
      table: {
        category: 'Textos',
        defaultValue: { summary: 'Enter a valid date.' },
      },
    },
    formatText: {
      control: 'text',
      description:
        'Formato da digitação, com `editable`: placeholder, texto abaixo do campo sem `hint` e descrição acessível',
      table: {
        category: 'Textos',
        defaultValue: { summary: 'formato do locale, como dd / mm / yyyy' },
      },
    },
    rangeErrorText: {
      control: 'text',
      description: 'Mensagem de erro quando a data fica fora de `min` e `max`',
      table: {
        category: 'Textos',
        defaultValue: { summary: 'Enter a date within the allowed period.' },
      },
    },
    rangeOrderText: {
      control: 'text',
      description:
        'Mensagem de erro, com `editable range`, quando a data final é anterior à inicial',
      table: {
        category: 'Textos',
        defaultValue: {
          summary: "The end date can't be before the start date.",
        },
      },
    },
    requiredText: {
      control: 'text',
      description:
        'Sem `editable`, texto oculto que descreve o campo como obrigatório quando `required` está ativo',
      table: { category: 'Textos', defaultValue: { summary: 'Required' } },
    },
    rangeStartText: {
      control: 'text',
      description:
        'Anúncio para leitores de tela, com `range`, depois que a primeira ponta é escolhida',
      table: {
        category: 'Textos',
        defaultValue: { summary: 'Start date selected. Choose the end date.' },
      },
    },
    dialogLabel: {
      control: 'text',
      description:
        'Nome acessível do calendário e, com `editable`, do botão que o abre',
      table: { category: 'Textos', defaultValue: { summary: 'Choose date' } },
    },
    previousMonthLabel: {
      control: 'text',
      description: '`aria-label` do botão de mês anterior',
      table: {
        category: 'Textos',
        defaultValue: { summary: 'Previous month' },
      },
    },
    nextMonthLabel: {
      control: 'text',
      description: '`aria-label` do botão de próximo mês',
      table: { category: 'Textos', defaultValue: { summary: 'Next month' } },
    },
  },
};

const Template = ({
  editable,
  range,
  label,
  placeholder,
  value,
  min,
  max,
  size,
  locale,
  firstDayOfWeek,
  name,
  required,
  optional,
  hint,
  error,
  errorText,
  disabled,
  optionalText,
  badInputText,
  formatText,
  rangeErrorText,
  rangeOrderText,
  requiredText,
  rangeStartText,
  dialogLabel,
  previousMonthLabel,
  nextMonthLabel,
}) => {
  const attrs = [
    editable ? 'editable' : '',
    range ? 'range' : '',
    label ? `label="${label}"` : '',
    placeholder ? `placeholder="${placeholder}"` : '',
    value ? `value="${value}"` : '',
    min ? `min="${min}"` : '',
    max ? `max="${max}"` : '',
    `size="${size ?? 'lg'}"`,
    locale ? `locale="${locale}"` : '',
    Number(firstDayOfWeek) ? `first-day-of-week="${firstDayOfWeek}"` : '',
    name ? `name="${name}"` : '',
    required ? 'required' : '',
    optional ? 'optional' : '',
    hint ? `hint="${hint}"` : '',
    error ? 'error' : '',
    errorText ? `error-text="${errorText}"` : '',
    disabled ? 'disabled' : '',
    optionalText ? `optional-text="${optionalText}"` : '',
    badInputText ? `bad-input-text="${badInputText}"` : '',
    formatText ? `format-text="${formatText}"` : '',
    rangeErrorText ? `range-error-text="${rangeErrorText}"` : '',
    rangeOrderText ? `range-order-text="${rangeOrderText}"` : '',
    requiredText ? `required-text="${requiredText}"` : '',
    rangeStartText ? `range-start-text="${rangeStartText}"` : '',
    dialogLabel ? `dialog-label="${dialogLabel}"` : '',
    previousMonthLabel ? `previous-month-label="${previousMonthLabel}"` : '',
    nextMonthLabel ? `next-month-label="${nextMonthLabel}"` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  return `<div style="width: 244px; min-height: 380px;">
  <lui-date-picker
    ${attrs}
  ></lui-date-picker>
</div>`;
};

export const DatePicker = Template.bind({});
DatePicker.storyName = 'Date Picker';
DatePicker.args = {
  editable: false,
  range: false,
  label: 'Label',
  placeholder: '',
  value: '',
  min: '',
  max: '',
  size: 'lg',
  locale: 'en-US',
  firstDayOfWeek: 0,
  name: '',
  required: false,
  optional: false,
  hint: '',
  error: false,
  errorText: 'This field is required.',
  disabled: false,
  optionalText: '(optional)',
  badInputText: 'Enter a valid date.',
  formatText: '',
  rangeErrorText: 'Enter a date within the allowed period.',
  rangeOrderText: "The end date can't be before the start date.",
  requiredText: 'Required',
  rangeStartText: 'Start date selected. Choose the end date.',
  dialogLabel: 'Choose date',
  previousMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
};

export const Open = () => `
  <div style="width: 244px; min-height: 380px;">
    <lui-date-picker label="Label" value="2026-01-16" open></lui-date-picker>
  </div>
`;
Open.storyName = 'Calendar open';
Open.parameters = {
  docs: {
    description: {
      story:
        'O calendário abre abaixo do campo, no mês da data selecionada. Sem valor, abre no mês atual. O dia selecionado tem fundo primário e o dia de hoje tem texto primário. As células dos meses vizinhos ficam vazias.',
    },
  },
};

export const Range = () => `
  <div style="width: 244px; min-height: 380px;">
    <lui-date-picker
      range
      label="Stay"
      value="2026-01-16/2026-01-21"
      open
    ></lui-date-picker>
  </div>
`;
Range.parameters = {
  docs: {
    description: {
      story:
        'Com `range`, o calendário mostra dois meses lado a lado. O primeiro clique marca uma ponta do intervalo e o segundo marca a outra, em qualquer ordem. Entre os dois cliques, o intervalo acompanha o ponteiro ou o foco. O `value` é um intervalo ISO 8601: `2026-01-16/2026-01-21`.',
    },
  },
};

export const Editable = () => `
  <div style="width: 280px; min-height: 380px; display: flex; flex-direction: column; gap: 16px;">
    <lui-date-picker
      editable
      label="Data de nascimento"
      locale="pt-BR"
      format-text="dd / mm / aaaa"
      dialog-label="Escolher data"
      bad-input-text="Digite uma data válida."
    ></lui-date-picker>
    <lui-date-picker
      editable
      range
      label="Período"
      locale="pt-BR"
      value="2026-01-16/2026-01-21"
      format-text="dd / mm / aaaa – dd / mm / aaaa"
      dialog-label="Escolher datas"
      range-order-text="A data final não pode ser anterior à inicial."
    ></lui-date-picker>
  </div>
`;
Editable.storyName = 'Typed entry';
Editable.parameters = {
  docs: {
    description: {
      story:
        'Com `editable`, a data pode ser digitada. A máscara segue o formato do `locale` e o calendário continua disponível pelo botão ao lado. O `value` só muda quando o texto forma uma data completa e válida.',
    },
  },
};

export const MinMax = () => `
  <div style="width: 244px; min-height: 380px;">
    <lui-date-picker
      label="Check-in"
      value="2026-01-16"
      min="2026-01-12"
      max="2026-01-28"
      hint="Between Jan 12 and Jan 28."
    ></lui-date-picker>
  </div>
`;
MinMax.storyName = 'Min and max';
MinMax.parameters = {
  docs: {
    description: {
      story:
        'Datas fora de `min` e `max` aparecem desabilitadas e não podem ser escolhidas. A navegação entre meses e o teclado param nos limites. Um `value` fora dos limites deixa o campo inválido no form, com `rangeUnderflow` ou `rangeOverflow`.',
    },
  },
};

export const Error = () => `
  <div style="width: 244px;">
    <lui-date-picker
      label="Label"
      placeholder="Placeholder"
      error
      error-text="Campo obrigatório."
    ></lui-date-picker>
  </div>
`;

export const Disabled = () => `
  <div style="width: 244px;">
    <lui-date-picker
      label="Label"
      value="2026-01-16"
      disabled
    ></lui-date-picker>
  </div>
`;

export const Sizes = () => `
  <div style="width: 244px; display: flex; flex-direction: column; gap: 16px;">
    <lui-date-picker label="Large" value="2026-01-16" size="lg"></lui-date-picker>
    <lui-date-picker label="Medium" value="2026-01-16" size="md"></lui-date-picker>
  </div>
`;
Sizes.parameters = {
  docs: {
    description: {
      story:
        'Os tamanhos são os mesmos do Input. Use `lg` em formulários e `md` em áreas densas, como filtros e toolbars.',
    },
  },
};

export const Localized = () => `
  <div style="width: 244px; min-height: 380px;">
    <lui-date-picker
      label="Data de entrega"
      value="2026-10-16"
      placeholder="Selecione uma data"
      locale="pt-BR"
      first-day-of-week="1"
      dialog-label="Escolher data"
      previous-month-label="Mês anterior"
      next-month-label="Próximo mês"
      error-text="Campo obrigatório."
    ></lui-date-picker>
  </div>
`;
Localized.storyName = 'Locale and first day of week';
Localized.parameters = {
  docs: {
    description: {
      story:
        'Com `locale`, o texto do campo, o mês e os dias da semana seguem o idioma escolhido. O `value` continua em ISO 8601. `first-day-of-week` define a primeira coluna do calendário.',
    },
  },
};

export const FormIntegration = () => {
  const container = document.createElement('div');
  container.style.cssText =
    'max-width: 360px; min-height: 480px; display: flex; flex-direction: column; gap: 24px;';
  container.innerHTML = `
    <form id="date-picker-demo-form" style="display: flex; flex-direction: column; gap: 16px;">
      <lui-date-picker
        name="start"
        label="Start date"
        required
        error-text="Start date is required."
      ></lui-date-picker>
      <lui-date-picker
        name="stay"
        label="Stay"
        range
        placeholder="Select dates"
      ></lui-date-picker>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <lui-button type="reset" variant="secondary" size="md">Reset</lui-button>
        <lui-button type="submit" variant="primary" size="md">Submit</lui-button>
      </div>
    </form>
    <p id="date-picker-demo-feedback" style="font-size: 13px; min-height: 18px;"></p>
  `;

  const form = container.querySelector('#date-picker-demo-form');
  const feedback = container.querySelector('#date-picker-demo-feedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    feedback.style.color = 'green';
    feedback.textContent = `✓ start = ${data.get('start')}, stay = ${data.get('stay') ?? '(vazio)'}`;
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
        'O valor é enviado em ISO 8601 com o `name` do campo: `YYYY-MM-DD` para uma data e `YYYY-MM-DD/YYYY-MM-DD` para um intervalo. Com `required`, o form só é enviado depois que uma data é escolhida.',
    },
  },
};

export const CSSClass = () => `
  <div style="width: 244px;">
    <div class="date-picker date-picker--lg">
      <div class="date-picker__head">
        <div class="date-picker__label-wrap">
          <label for="css-date-picker">Label</label>
        </div>
      </div>
      <div class="date-picker__anchor">
        <button id="css-date-picker" type="button" class="date-picker__control" aria-haspopup="dialog" aria-expanded="false">
          <span class="date-picker__value">Jan 16, 2026</span>
          <span class="date-picker__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false"><path d="M19.5 10.5H4.5V20.25H19.5V10.5ZM16.5 5.25V6C16.5 6.41 16.16 6.75 15.75 6.75C15.34 6.75 15 6.41 15 6V5.25H9V6C9 6.41 8.66 6.75 8.25 6.75C7.84 6.75 7.5 6.41 7.5 6V5.25H4.5V9H19.5V5.25H16.5ZM21 20.25C21 20.65 20.84 21.03 20.56 21.31C20.28 21.59 19.9 21.75 19.5 21.75H4.5C4.1 21.75 3.72 21.59 3.44 21.31C3.16 21.03 3 20.65 3 20.25V5.25C3 4.85 3.16 4.47 3.44 4.19C3.72 3.91 4.1 3.75 4.5 3.75H7.5V3C7.5 2.59 7.84 2.25 8.25 2.25C8.66 2.25 9 2.59 9 3V3.75H15V3C15 2.59 15.34 2.25 15.75 2.25C16.16 2.25 16.5 2.59 16.5 3V3.75H19.5C19.9 3.75 20.28 3.91 20.56 4.19C20.84 4.47 21 4.85 21 5.25V20.25Z"></path></svg>
          </span>
        </button>
      </div>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
CSSClass.parameters = {
  docs: {
    description: {
      story:
        'Sem o Web Component, só o campo funciona. Abrir o calendário, navegar e selecionar dependem do JavaScript do componente. As classes `.date-picker-calendar__*` ficam disponíveis para quem montar o próprio calendário.',
    },
  },
};
