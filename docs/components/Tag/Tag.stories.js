import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Content/Tag',
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    style: {
      control: {
        type: 'select',
      },
      options: ['surface', 'container'],
    },
    variant: {
      control: {
        type: 'select',
      },
      options: ['primary', 'caution', 'danger', 'success', 'neutral'],
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['lg', 'md', 'sm'],
    },
  },
};

const Template = ({ label, style, variant, size }) => {
  const classes = [style && `tag--${style}-${variant}`, size && `tag--${size}`]
    .filter(Boolean)
    .join(' ');

  return `
    <div class="${classes}">${label}</div>
  `;
};

export const Primary = Template.bind({});
Primary.args = {
  label: 'Tag',
  style: 'surface',
  variant: 'primary',
  size: 'md',
};

export const Caution = Template.bind({});
Caution.args = {
  label: 'Tag',
  style: 'surface',
  variant: 'caution',
  size: 'md',
};

export const Danger = Template.bind({});
Danger.args = {
  label: 'Tag',
  style: 'surface',
  variant: 'danger',
  size: 'md',
};

export const Success = Template.bind({});
Success.args = {
  label: 'Tag',
  style: 'surface',
  variant: 'success',
  size: 'md',
};

export const Neutral = Template.bind({});
Neutral.args = {
  label: 'Tag',
  style: 'surface',
  variant: 'neutral',
  size: 'md',
};

export const SizeLg = Template.bind({});
SizeLg.args = {
  label: 'Tag',
  style: 'surface',
  variant: 'primary',
  size: 'lg',
};

export const SizeMd = Template.bind({});
SizeMd.args = {
  label: 'Tag',
  style: 'surface',
  variant: 'primary',
  size: 'md',
};
