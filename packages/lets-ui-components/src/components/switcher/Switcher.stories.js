import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Switcher',
  argTypes: {
    threshold: { control: 'text' },
    gap: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
  },
};

const card = (label, color) =>
  `<div style="padding: 24px 16px; background: ${color}; border-radius: 6px; font-size: 13px; text-align: center;">${label}</div>`;

const Template = ({ threshold, gap }) => `
  <div style="resize: horizontal; overflow: auto; min-width: 200px; max-width: 100%; border: 1px dashed #94a3b8; padding: 8px; border-radius: 4px;">
    <p style="font-size: 12px; color: #64748b; margin: 0 0 8px;">Resize the container to see the switch effect</p>
    <lui-switcher threshold="${threshold}" gap="${gap}">
      ${card('Panel A', '#dbeafe')}
      ${card('Panel B', '#dcfce7')}
      ${card('Panel C', '#fef9c3')}
    </lui-switcher>
  </div>
`;

export const Default = Template.bind({});
Default.args = { threshold: '320px', gap: 'md' };

export const WideThreshold = Template.bind({});
WideThreshold.args = { threshold: '500px', gap: 'lg' };

export const CSSClass = () => `
  <div class="switcher switcher--gap-md">
    <div>Panel A</div>
    <div>Panel B</div>
    <div>Panel C</div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
