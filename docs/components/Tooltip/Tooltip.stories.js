import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Components/Tooltip',
  argTypes: {
    text: { control: 'text' },
    position: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
    },
    label: { control: 'text' },
  },
};

const Template = ({ text, position, label }) => {
  const attrs = [
    `text="${text}"`,
    `position="${position}"`,
    label ? `label="${label}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<div style="padding:64px;display:flex;justify-content:center;">
    <lui-tooltip ${attrs}></lui-tooltip>
  </div>`;
};

export const Tooltip = Template.bind({});
Tooltip.args = {
  text: 'This is a tooltip',
  position: 'top',
  label: 'Hover me',
};

export const Positions = () => `
  <div style="display:flex;gap:48px;padding:80px;justify-content:center;align-items:center;flex-wrap:wrap;">
    ${['top', 'right', 'bottom', 'left']
      .map(
        (pos) => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <p style="font-size:12px;opacity:.6;margin:0">${pos}</p>
        <lui-tooltip text="Tooltip ${pos}" position="${pos}" label="${pos}"></lui-tooltip>
      </div>
    `
      )
      .join('')}
  </div>
`;

export const WithCustomTrigger = () => `
  <div style="padding:80px;display:flex;gap:32px;justify-content:center;align-items:center;flex-wrap:wrap;">
    <lui-tooltip text="Edit this item" position="top">
      <lui-icon-button label="Edit" icon="pencil"></lui-icon-button>
    </lui-tooltip>
    <lui-tooltip text="More options available" position="right">
      <lui-button label="Options" variant="secondary"></lui-button>
    </lui-tooltip>
    <lui-tooltip text="Hover over any element" position="bottom">
      <span style="cursor:default;font-weight:600;">Custom span trigger</span>
    </lui-tooltip>
  </div>
`;
