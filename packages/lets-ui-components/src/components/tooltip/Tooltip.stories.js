import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Content/Tooltip',
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
    <lui-tooltip text="Delete this item" position="top">
      <lui-icon-button aria-label="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.75 6C19.1642 6 19.5 6.33579 19.5 6.75C19.5 7.16421 19.1642 7.5 18.75 7.5H18V19.5C18 20.3284 17.3284 21 16.5 21H7.5C6.67157 21 6 20.3284 6 19.5V7.5H5.25C4.83579 7.5 4.5 7.16421 4.5 6.75C4.5 6.33579 4.83579 6 5.25 6H18.75ZM7.5 19.5H16.5V7.5H7.5V19.5ZM14.25 3C14.6642 3 15 3.33579 15 3.75C15 4.16421 14.6642 4.5 14.25 4.5H9.75C9.33579 4.5 9 4.16421 9 3.75C9 3.33579 9.33579 3 9.75 3H14.25Z"/></svg>
      </lui-icon-button>
    </lui-tooltip>
    <lui-tooltip text="More options available" position="right">
      <lui-button label="Options" variant="secondary"></lui-button>
    </lui-tooltip>
    <lui-tooltip text="Hover over any element" position="bottom">
      <span style="cursor:default;font-weight:600;">Custom span trigger</span>
    </lui-tooltip>
  </div>
`;

export const CSSClass = () => `
  <div style="padding: 80px; display: flex; justify-content: center;">
    <div class="tooltip tooltip--top">
      <button class="tooltip__trigger">Hover aqui</button>
      <div role="tooltip" class="tooltip__content">Texto do tooltip</div>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
