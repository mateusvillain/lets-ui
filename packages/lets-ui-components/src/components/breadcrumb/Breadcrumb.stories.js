import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Navigation/Breadcrumb',
  argTypes: {
    label: { control: 'text' },
  },
};

const Template = ({ label }) =>
  `<lui-breadcrumb items="Item 1,Item 2,Item 3" label="${label}"></lui-breadcrumb>`;

export const Breadcrumb = Template.bind({});
Breadcrumb.args = {
  label: 'Page',
};

export const Primary = () => `
  <lui-breadcrumb items="Item 1,Item 2,Item 3,Item 4" label="Item 5"></lui-breadcrumb>
`;

export const WithSlots = () => `
  <lui-breadcrumb>
    <lui-breadcrumb-item href="/item1">Item 1</lui-breadcrumb-item>
    <lui-breadcrumb-item href="/item2">Item 2</lui-breadcrumb-item>
    <lui-breadcrumb-item href="/item3">Item 3</lui-breadcrumb-item>
    <lui-breadcrumb-item active>Página atual</lui-breadcrumb-item>
  </lui-breadcrumb>
`;
WithSlots.storyName = 'Com slots';
WithSlots.parameters = { controls: { disable: true } };
