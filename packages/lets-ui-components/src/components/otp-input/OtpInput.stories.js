import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/OTP Input',
  argTypes: {
    length: { control: { type: 'number', min: 1 } },
    type: {
      control: { type: 'select' },
      options: ['text', 'number'],
      table: { defaultValue: { summary: 'text' } },
    },
    separator: {
      control: 'text',
      description:
        'Posições das caixas após as quais aparece um separador, separadas por vírgula ("3", "2,4"). Vazio, não há separador.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'boolean' },
    errorText: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    showLabel: {
      control: 'boolean',
      description:
        'Exibe o label acima das caixas. Desligado, o label só nomeia o grupo para tecnologias assistivas.',
      table: { defaultValue: { summary: 'false' } },
    },
    fieldLabel: { control: 'text' },
  },
};

const Template = ({
  length,
  type,
  separator,
  value,
  placeholder,
  error,
  errorText,
  hint,
  disabled,
  label,
  showLabel,
  fieldLabel,
}) => `
  <lui-otp-input
    length="${length}"
    type="${type}"
    separator="${separator}"
    value="${value}"
    placeholder="${placeholder}"
    ${error ? 'error' : ''}
    error-text="${errorText}"
    hint="${hint}"
    ${disabled ? 'disabled' : ''}
    label="${label}"
    ${showLabel ? 'show-label' : ''}
    field-label="${fieldLabel}"
  ></lui-otp-input>
`;

export const Default = Template.bind({});
Default.args = {
  length: 6,
  type: 'text',
  separator: '3',
  value: '',
  placeholder: '',
  error: false,
  errorText: 'This field is required.',
  hint: '',
  disabled: false,
  label: 'Verification code',
  showLabel: false,
  fieldLabel: 'Character {index} of {length}',
};

export const VisibleLabel = () => `
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <lui-otp-input
      type="number"
      separator="3"
      show-label
      label="Código de verificação"
      hint="Digite o código de 6 dígitos enviado por SMS."
    ></lui-otp-input>
    <lui-otp-input
      type="number"
      separator="3"
      label="Código de verificação"
      hint="Digite o código de 6 dígitos enviado por SMS."
    ></lui-otp-input>
  </div>
`;
VisibleLabel.storyName = 'Rótulo visível';
VisibleLabel.parameters = { controls: { disable: true } };

export const Numeric = () => `
  <lui-otp-input type="number" hint="Digite o código enviado por SMS."></lui-otp-input>
`;
Numeric.storyName = 'Numérico';
Numeric.parameters = { controls: { disable: true } };

export const Error = () => `
  <lui-otp-input type="number" value="123456" separator="3" error error-text="Código inválido."></lui-otp-input>
`;
Error.storyName = 'Erro';
Error.parameters = { controls: { disable: true } };

export const Disabled = () => `
  <lui-otp-input value="123" disabled></lui-otp-input>
`;
Disabled.parameters = { controls: { disable: true } };

export const Lengths = () => `
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <lui-otp-input length="4" type="number"></lui-otp-input>
    <lui-otp-input length="6" type="number"></lui-otp-input>
    <lui-otp-input length="8" type="number"></lui-otp-input>
  </div>
`;
Lengths.storyName = 'Comprimentos';
Lengths.parameters = { controls: { disable: true } };

export const Separator = () => `
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <lui-otp-input type="number"></lui-otp-input>
    <lui-otp-input type="number" separator="3"></lui-otp-input>
    <lui-otp-input type="number" separator="2,4"></lui-otp-input>
    <lui-otp-input length="8" separator="4"></lui-otp-input>
  </div>
`;
Separator.storyName = 'Separador';
Separator.parameters = { controls: { disable: true } };

export const CompleteEvent = () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';
  wrapper.innerHTML = `
    <lui-otp-input type="number"></lui-otp-input>
    <p>Código completo: <output>—</output></p>
  `;
  const output = wrapper.querySelector('output');
  wrapper.addEventListener('lui-complete', (e) => {
    output.textContent = e.detail.value;
  });
  return wrapper;
};
CompleteEvent.storyName = 'Evento lui-complete';
CompleteEvent.parameters = { controls: { disable: true } };

export const FormIntegration = () => {
  const form = document.createElement('form');
  form.style.cssText =
    'display: flex; flex-direction: column; align-items: flex-start; gap: 16px;';
  form.innerHTML = `
    <lui-otp-input name="code" type="number" required></lui-otp-input>
    <lui-button type="submit">Verificar</lui-button>
    <output></output>
  `;
  const output = form.querySelector('output');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    output.textContent = `code = ${new FormData(form).get('code')}`;
  });
  return form;
};
FormIntegration.storyName = 'Integração com formulários';
FormIntegration.parameters = { controls: { disable: true } };

const cssField = (n, extra = '') =>
  `<input class="otp-input__field" type="text" inputmode="numeric" aria-label="Character ${n} of 6"${extra}>`;

export const CSSClass = () => `
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <div class="otp-input">
      <span class="otp-input__label" id="otp-css-label">Verification code</span>
      <div class="otp-input__group" role="group" aria-labelledby="otp-css-label">
        ${cssField(1, ' autocomplete="one-time-code"')}${cssField(2)}${cssField(3)}
        <span class="otp-input__separator" aria-hidden="true"></span>
        ${cssField(4)}${cssField(5)}${cssField(6)}
      </div>
    </div>
    <div class="otp-input otp-input--error">
      <div class="otp-input__group" role="group" aria-label="Verification code">
        ${cssField(1, ' aria-invalid="true" aria-describedby="otp-css-error"')}${cssField(2, ' aria-invalid="true" aria-describedby="otp-css-error"')}${cssField(3, ' aria-invalid="true" aria-describedby="otp-css-error"')}
        <span class="otp-input__separator" aria-hidden="true"></span>
        ${cssField(4, ' aria-invalid="true" aria-describedby="otp-css-error"')}${cssField(5, ' aria-invalid="true" aria-describedby="otp-css-error"')}${cssField(6, ' aria-invalid="true" aria-describedby="otp-css-error"')}
      </div>
      <p class="otp-input__message" id="otp-css-error">Campo obrigatório.</p>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
CSSClass.parameters = { controls: { disable: true } };
