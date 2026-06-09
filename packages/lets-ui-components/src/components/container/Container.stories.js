import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Layout/Container',
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    center: { control: 'boolean' },
    as: {
      control: { type: 'select' },
      options: ['div', 'section', 'main', 'article'],
    },
  },
};

const Template = ({ size, padding, center, as: asTag }) => `
  <div style="background: #f1f5f9; padding: 8px;">
    <lui-container size="${size}" padding="${padding}" ${center ? 'center' : ''} as="${asTag}">
      <div style="background: #dbeafe; padding: 16px; border-radius: 6px; font-size: 14px;">
        Container content — max-width: ${size === 'full' ? 'none' : { xs: '480px', sm: '768px', md: '1024px', lg: '1280px', xl: '1440px' }[size]}
      </div>
    </lui-container>
  </div>
`;

export const Default = Template.bind({});
Default.args = { size: 'lg', padding: 'xl', center: true, as: 'div' };

export const Small = Template.bind({});
Small.args = { size: 'sm', padding: 'md', center: true, as: 'div' };

export const Full = Template.bind({});
Full.args = { size: 'full', padding: 'lg', center: false, as: 'div' };

export const CSSClass = () => `
  <div class="container container--md">
    Conteúdo centralizado
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
