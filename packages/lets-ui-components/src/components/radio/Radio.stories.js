import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Form and options/Radio',
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    checked: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
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

const Template = ({ label, value, checked, disabled, size }) => {
  const attrs = [
    `size="${size ?? 'lg'}"`,
    value ? `value="${value}"` : '',
    checked ? 'checked' : '',
    disabled ? 'disabled' : '',
  ]
    .filter(Boolean)
    .join('\n  ');

  return `<lui-radio\n  ${attrs}\n>\n  ${label ?? ''}\n</lui-radio>`;
};

export const Radio = Template.bind({});
Radio.args = {
  label: 'Radio label',
  value: 'option',
  checked: false,
  disabled: false,
  size: 'lg',
};

export const LabelAttribute = () =>
  `<lui-radio label="Opção via atributo" value="option" size="lg"></lui-radio>`;
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
  `<lui-radio value="selected" checked size="lg">Opção selecionada</lui-radio>`;

export const Small = () =>
  `<lui-radio value="option" size="md">Label</lui-radio>`;

export const Disabled = () =>
  `<lui-radio value="option" checked disabled size="lg">Desabilitado</lui-radio>`;

export const CSSClass = () => `
  <label class="radio radio--lg">
    <input type="radio" name="opcao" value="a">
    Opção A
  </label>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
