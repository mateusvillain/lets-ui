import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Actionable/Button',
  // tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    variant: {
      control: {
        type: 'select',
      },
      options: ['primary', 'secondary', 'danger', 'success'],
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['lg', 'md'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

const Template = ({ label, variant, size, disabled }) => {
  const classes = ['btn', variant && `btn--${variant}`, size && `btn--${size}`]
    .filter(Boolean)
    .join(' ');

  return `
    <button class="${classes}" ${disabled ? 'disabled' : ''}>
      ${label}
    </button>
  `;
};

export const Button = Template.bind({});
Button.args = {
  label: 'Botão',
  variant: 'primary',
  size: 'lg',
  disabled: false,
};

export const Primary = () => `
  <button class="btn btn--primary btn--lg">Secondary Button</button>
`;

export const Secondary = () => `
  <button class="btn btn--secondary btn--lg">Secondary Button</button>
`;

export const Danger = () => `
  <button class="btn btn--danger btn--lg">Danger Button</button>
`;

export const Success = () => `
  <button class="btn btn--success btn--lg">Success Button</button>
`;
