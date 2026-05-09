import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import 'lets-ui-icons/dist/lets-ui-icons.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Content/Alert',
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['caution', 'danger', 'info', 'success'],
    },
    title: { control: 'text' },
    content: { control: 'text' },
  },
};

const Template = ({ variant, title, content }) => `
  <lui-alert
    variant="${variant ?? 'success'}"
    title="${title ?? ''}"
    content="${content ?? ''}"
  >
    <button slot="actions" class="btn btn--secondary btn--lg">Dismiss</button>
    <button slot="actions" class="btn btn--primary btn--lg">Action</button>
  </lui-alert>
`;

const baseArgs = {
  variant: 'success',
  title: 'Alert title',
  content: 'Description',
};

export const Alert = Template.bind({});
Alert.args = { ...baseArgs };

export const Success = Template.bind({});
Success.args = { ...baseArgs, variant: 'success' };

export const Caution = Template.bind({});
Caution.args = { ...baseArgs, variant: 'caution' };

export const Danger = Template.bind({});
Danger.args = { ...baseArgs, variant: 'danger' };

export const Info = Template.bind({});
Info.args = { ...baseArgs, variant: 'info' };

export const WithoutActions = () => `
  <lui-alert
    variant="success"
    title="Alert sem ações"
    content="Este alert não possui botões de ação."
  ></lui-alert>
`;
WithoutActions.storyName = 'Without actions';
