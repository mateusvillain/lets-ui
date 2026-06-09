import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Inline',
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
    wrap: {
      control: { type: 'select' },
      options: ['wrap', 'nowrap', 'wrap-reverse'],
    },
  },
};

const chip = (label, color = '#dbeafe') =>
  `<span style="padding: 6px 12px; background: ${color}; border-radius: 999px; font-size: 13px; white-space: nowrap;">${label}</span>`;

const Template = ({ gap, align, justify, wrap }) => `
  <div style="width: 400px; outline: 1px dashed #cbd5e1; padding: 8px; border-radius: 4px;">
    <lui-inline gap="${gap}" align="${align}" justify="${justify}" wrap="${wrap}">
      ${chip('Design')}
      ${chip('Engineering', '#dcfce7')}
      ${chip('Product', '#fef9c3')}
      ${chip('Research', '#fce7f3')}
      ${chip('Analytics', '#ede9fe')}
    </lui-inline>
  </div>
`;

export const Default = Template.bind({});
Default.args = { gap: 'sm', align: 'center', justify: 'start', wrap: 'wrap' };

export const SpaceBetween = Template.bind({});
SpaceBetween.args = {
  gap: 'sm',
  align: 'center',
  justify: 'space-between',
  wrap: 'wrap',
};

export const NoWrap = Template.bind({});
NoWrap.args = { gap: 'sm', align: 'center', justify: 'start', wrap: 'nowrap' };

export const CSSClass = () => `
  <div class="inline inline--gap-sm">
    <span>Design</span>
    <span>Engineering</span>
    <span>Product</span>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
