import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Navigation/Breadcrumb',
  argTypes: {
    page: { control: 'text' },
    link: { control: 'text' },
    ariaLabel: { control: 'text' },
  },
};

const Template = ({ page, link, ariaLabel }) => `
  <lui-breadcrumb aria-label="${ariaLabel}">
    <lui-breadcrumb-item href="${link}">${page} 1</lui-breadcrumb-item>
    <lui-breadcrumb-item href="${link}">${page} 2</lui-breadcrumb-item>
    <lui-breadcrumb-item href="${link}">${page} 3</lui-breadcrumb-item>
    <lui-breadcrumb-item active>${page} 4</lui-breadcrumb-item>
  </lui-breadcrumb>
`;

export const Default = Template.bind({});
Default.parameters = { controls: { disable: true } };
Default.args = {
  page: 'Página',
  link: '#',
  ariaLabel: 'Breadcrumb',
};
