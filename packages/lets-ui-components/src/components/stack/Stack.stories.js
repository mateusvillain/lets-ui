import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Stack',
  argTypes: {
    gap: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    align: {
      control: { type: 'select' },
      options: ['start', 'end', 'center', 'stretch', 'baseline'],
    },
    justify: {
      control: { type: 'select' },
      options: [
        'start',
        'end',
        'center',
        'space-between',
        'space-around',
        'space-evenly',
      ],
    },
  },
};

const box = (label, color = '#e5e7eb') =>
  `<div style="padding: 12px 16px; background: ${color}; border-radius: 6px; font-size: 13px;">${label}</div>`;

const Template = ({ gap, align, justify }) => `
  <div style="width: 300px; outline: 1px dashed #cbd5e1; padding: 8px; border-radius: 4px;">
    <lui-stack gap="${gap}" align="${align}" justify="${justify}">
      ${box('Item 1', '#dbeafe')}
      ${box('Item 2', '#dcfce7')}
      ${box('Item 3', '#fef9c3')}
    </lui-stack>
  </div>
`;

export const Default = Template.bind({});
Default.args = { gap: 'md', align: 'stretch', justify: 'start' };

export const SmallGap = Template.bind({});
SmallGap.args = { gap: 'sm', align: 'stretch', justify: 'start' };

export const Centered = Template.bind({});
Centered.args = { gap: 'md', align: 'center', justify: 'start' };

export const SpaceBetween = Template.bind({});
SpaceBetween.storyName = 'Space Between (fixed height)';
SpaceBetween.args = { gap: 'md', align: 'stretch', justify: 'space-between' };
SpaceBetween.decorators = [
  (story) => `<div style="height: 240px;">${story()}</div>`,
];
