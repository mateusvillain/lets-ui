import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Stack',
  argTypes: {
    gap: {
      control: { type: 'select' },
      options: [
        '0',
        '2',
        '4',
        '8',
        '12',
        '16',
        '20',
        '24',
        '32',
        '40',
        '48',
        '56',
        '64',
        '72',
        '80',
      ],
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
Default.args = { gap: '16', align: 'stretch', justify: 'start' };

export const SmallGap = Template.bind({});
SmallGap.args = { gap: '8', align: 'stretch', justify: 'start' };

export const Centered = Template.bind({});
Centered.args = { gap: '16', align: 'center', justify: 'start' };

export const SpaceBetween = Template.bind({});
SpaceBetween.storyName = 'Space Between (fixed height)';
SpaceBetween.args = { gap: '16', align: 'stretch', justify: 'space-between' };
SpaceBetween.decorators = [
  (story) => `<div style="height: 240px;">${story()}</div>`,
];

export const CSSClass = () => `
  <div class="stack stack--gap-16">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
