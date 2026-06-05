import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Bleed',
  argTypes: {
    horizontal: { control: 'boolean' },
    vertical: { control: 'boolean' },
    left: { control: 'boolean' },
    right: { control: 'boolean' },
    top: { control: 'boolean' },
    bottom: { control: 'boolean' },
    amount: { control: 'text' },
  },
};

const containerStyle =
  'background: #f1f5f9; padding: 32px; border-radius: 8px; overflow: hidden;';

const Template = ({
  horizontal,
  vertical,
  left,
  right,
  top,
  bottom,
  amount,
}) => `
  <div style="${containerStyle}">
    <p style="font-size: 13px; margin: 0 0 16px; color: #64748b;">Container with padding (gray area)</p>
    <lui-bleed
      ${horizontal ? 'horizontal' : ''}
      ${vertical ? 'vertical' : ''}
      ${left ? 'left' : ''}
      ${right ? 'right' : ''}
      ${top ? 'top' : ''}
      ${bottom ? 'bottom' : ''}
      ${amount ? `amount="${amount}"` : ''}
    >
      <div style="background: #dbeafe; padding: 16px; font-size: 13px;">
        Bleed element — escapes container padding
      </div>
    </lui-bleed>
    <p style="font-size: 13px; margin: 16px 0 0; color: #64748b;">Content below</p>
  </div>
`;

export const Default = Template.bind({});
Default.args = {
  horizontal: false,
  vertical: false,
  left: false,
  right: false,
  top: false,
  bottom: false,
  amount: '',
};

export const HorizontalBleed = Template.bind({});
HorizontalBleed.args = {
  horizontal: true,
  vertical: false,
  left: false,
  right: false,
  top: false,
  bottom: false,
  amount: '',
};

export const LeftOnly = Template.bind({});
LeftOnly.args = {
  horizontal: false,
  vertical: false,
  left: true,
  right: false,
  top: false,
  bottom: false,
  amount: '',
};

export const CustomAmount = Template.bind({});
CustomAmount.args = {
  horizontal: true,
  vertical: false,
  left: false,
  right: false,
  top: false,
  bottom: false,
  amount: 'xl',
};
