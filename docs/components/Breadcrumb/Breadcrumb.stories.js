import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';

export default {
  title: 'Navigation/Breadcrumb',
  // tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
  },
};

const Template = ({ label }) => {
  return `
    <ul class="breadcrumb">
      <li><a class="link">Item 1</a></li>
      <li><a class="link">Item 2</a></li>
      <li><a class="link">Item 3</a></li>
      <li>${label}</li>
    </ul>
  `;
};

export const Breadcrumb = Template.bind({});
Breadcrumb.args = {
  label: 'Page',
};

export const Primary = () => `
  <ul class="breadcrumb">
    <li><a>Item 1</a></li>
    <li><a>Item 2</a></li>
    <li><a>Item 3</a></li>
    <li><a>Item 4</a></li>
  </ul>
`;
