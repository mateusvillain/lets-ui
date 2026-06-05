import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Box',
  argTypes: {
    padding: {
      control: { type: 'select' },
      options: ['', 'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    background: { control: 'text' },
    borderRadius: { control: 'text' },
    borderWidth: { control: 'text' },
    borderColor: { control: 'text' },
    overflow: {
      control: { type: 'select' },
      options: ['', 'visible', 'hidden', 'scroll', 'auto'],
    },
    as: {
      control: { type: 'select' },
      options: ['div', 'section', 'article', 'main', 'aside'],
    },
  },
};

const Template = ({
  padding,
  background,
  borderRadius,
  borderWidth,
  borderColor,
  overflow,
  as: asTag,
}) => `
  <lui-box
    padding="${padding}"
    background="${background}"
    border-radius="${borderRadius}"
    border-width="${borderWidth}"
    border-color="${borderColor}"
    overflow="${overflow}"
    as="${asTag}"
  >
    <p style="margin: 0; font-size: 14px;">Box content goes here.</p>
  </lui-box>
`;

export const Default = Template.bind({});
Default.args = {
  padding: 'md',
  background: '#f1f5f9',
  borderRadius: '8px',
  borderWidth: '1px',
  borderColor: '#cbd5e1',
  overflow: 'visible',
  as: 'div',
};

export const Card = () => `
  <lui-box
    padding="lg"
    background="var(--lui-color-neutral-background-surface)"
    border-radius="12px"
    border-width="1px"
    border-color="var(--lui-color-neutral-border-subtle)"
  >
    <p style="margin: 0 0 8px; font-weight: 600;">Card-like Box</p>
    <p style="margin: 0; font-size: 14px; color: #64748b;">A box with surface background and subtle border.</p>
  </lui-box>
`;
