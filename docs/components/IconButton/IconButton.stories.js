import 'lets-ui-icons/dist/lets-ui-icons.css';
import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Actionable/Icon Button',
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: [
        'alert',
        'arrow-down',
        'arrow-left',
        'arrow-right',
        'arrow-top',
        'caret-down',
        'caret-down-circle',
        'caret-left',
        'caret-left-circle',
        'caret-right',
        'caret-right-circle',
        'caret-top',
        'caret-top-circle',
        'check',
        'check-circle',
        'dots-nine',
        'dots-three',
        'exclamation-circle',
        'info-circle',
        'link-external',
        'trash',
        'x',
        'x-circle',
      ],
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
    },
    weight: {
      control: { type: 'select' },
      options: ['outline', 'solid'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

const Template = ({ icon, size, weight, disabled }) => {
  const weightClass = weight === 'solid' ? 'lui-solid' : 'lui';
  return `
    <button
      class="icon-button icon-button--${size}"
      aria-label="${icon}"
      ${disabled ? 'disabled aria-disabled="true"' : ''}
    >
      <i class="${weightClass} lui-${icon}" aria-hidden="true"></i>
    </button>
  `;
};

export const IconButton = Template.bind({});
IconButton.args = {
  icon: 'check',
  size: 'lg',
  weight: 'outline',
  disabled: false,
};

export const Solid = Template.bind({});
Solid.args = {
  icon: 'check',
  size: 'lg',
  weight: 'solid',
  disabled: false,
};

export const SizeLg = Template.bind({});
SizeLg.args = {
  icon: 'info-circle',
  size: 'lg',
  weight: 'outline',
  disabled: false,
};
SizeLg.storyName = 'Size: Large';

export const SizeMd = Template.bind({});
SizeMd.args = {
  icon: 'info-circle',
  size: 'md',
  weight: 'outline',
  disabled: false,
};
SizeMd.storyName = 'Size: Medium';

export const Disabled = Template.bind({});
Disabled.args = {
  icon: 'trash',
  size: 'lg',
  weight: 'outline',
  disabled: true,
};

const AllIconsTemplate = () => {
  const icons = [
    'alert',
    'arrow-down',
    'arrow-left',
    'arrow-right',
    'arrow-top',
    'caret-down',
    'caret-down-circle',
    'caret-left',
    'caret-left-circle',
    'caret-right',
    'caret-right-circle',
    'caret-top',
    'caret-top-circle',
    'check',
    'check-circle',
    'dots-nine',
    'dots-three',
    'exclamation-circle',
    'info-circle',
    'link-external',
    'trash',
    'x',
    'x-circle',
  ];

  const buttons = icons
    .map(
      (icon) => `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <button class="icon-button icon-button--lg" aria-label="${icon}">
          <i class="lui lui-${icon}" aria-hidden="true"></i>
        </button>
        <span style="font-size: 11px; color: #64748b;">${icon}</span>
      </div>
    `
    )
    .join('');

  return `
    <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start;">
      ${buttons}
    </div>
  `;
};

export const AllIcons = AllIconsTemplate.bind({});
AllIcons.parameters = { controls: { disable: true } };
