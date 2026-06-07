import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Center',
  argTypes: {
    axis: {
      control: { type: 'select' },
      options: ['both', 'horizontal', 'vertical'],
    },
    minHeight: { control: 'text' },
    maxWidth: { control: 'text' },
  },
};

const content = `<div style="padding: 24px 32px; background: #dbeafe; border-radius: 8px; font-size: 14px;">Centered content</div>`;

const Template = ({ axis, minHeight, maxWidth }) => `
  <div style="background: #f1f5f9; height: 300px; border-radius: 8px; overflow: hidden;">
    <lui-center
      axis="${axis}"
      ${minHeight ? `min-height="${minHeight}"` : ''}
      ${maxWidth ? `max-width="${maxWidth}"` : ''}
      style="height: 100%;"
    >
      ${content}
    </lui-center>
  </div>
`;

export const Default = Template.bind({});
Default.args = { axis: 'both', minHeight: '', maxWidth: '' };

export const Horizontal = Template.bind({});
Horizontal.args = { axis: 'horizontal', minHeight: '', maxWidth: '' };

export const Vertical = Template.bind({});
Vertical.args = { axis: 'vertical', minHeight: '', maxWidth: '' };

export const WithMaxWidth = Template.bind({});
WithMaxWidth.args = { axis: 'both', minHeight: '', maxWidth: '400px' };
