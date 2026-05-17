import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Actionable/Button',
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'success'],
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
    },
    disabled: { control: 'boolean' },
  },
};

const Template = ({ label, variant, size, disabled }) =>
  `<lui-button
    label="${label}"
    variant="${variant}"
    size="${size}"
    ${disabled ? 'disabled' : ''}
  ></lui-button>`;

export const Button = Template.bind({});
Button.args = {
  label: 'Botão',
  variant: 'primary',
  size: 'lg',
  disabled: false,
};

export const Primary = () =>
  `<lui-button variant="primary" size="lg" label="Primary Button"></lui-button>`;

export const Secondary = () =>
  `<lui-button variant="secondary" size="lg" label="Secondary Button"></lui-button>`;

export const Danger = () =>
  `<lui-button variant="danger" size="lg" label="Danger Button"></lui-button>`;

export const Success = () =>
  `<lui-button variant="success" size="lg" label="Success Button"></lui-button>`;

export const Disabled = () =>
  `<lui-button variant="primary" size="lg" label="Disabled Button" disabled></lui-button>`;
