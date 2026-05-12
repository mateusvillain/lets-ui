import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Form and options/Radio',
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
    },
  },
};

const Template = ({ label, checked, disabled, size }) => {
  const sizeClass = size ? `radio--${size}` : '';

  return `
    <label class="radio ${sizeClass}">
      <input type="radio" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <span>${label || ''}</span>
    </label>
  `;
};

export const Radio = Template.bind({});
Radio.args = {
  label: 'Radio label',
  checked: false,
  disabled: false,
  size: 'lg',
};

export const Checked = Template.bind({});
Checked.args = {
  label: 'Selected option',
  checked: true,
  disabled: false,
  size: 'lg',
};

export const Small = Template.bind({});
Small.args = {
  label: 'Label',
  checked: false,
  disabled: false,
  size: 'md',
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Label',
  checked: true,
  disabled: true,
  size: 'lg',
};

const GroupTemplate = () => `
  <fieldset style="border: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
    <legend style="font-weight: 600; margin-bottom: 8px;">Escolha uma opção</legend>
    <label class="radio radio--lg">
      <input type="radio" name="story-group" value="opt1" checked>
      <span>Opção 1</span>
    </label>
    <label class="radio radio--lg">
      <input type="radio" name="story-group" value="opt2">
      <span>Opção 2</span>
    </label>
    <label class="radio radio--lg">
      <input type="radio" name="story-group" value="opt3" disabled>
      <span>Opção 3 (desabilitado)</span>
    </label>
  </fieldset>
`;

export const Group = GroupTemplate.bind({});
Group.parameters = { controls: { disable: true } };
