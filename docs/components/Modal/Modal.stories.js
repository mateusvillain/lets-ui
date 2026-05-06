import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import 'lets-ui-icons/dist/lets-ui-icons.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Components/Modal',
  argTypes: {
    title: { control: 'text' },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    'trigger-label': { control: 'text' },
  },
};

const Template = ({ title, size, 'trigger-label': triggerLabel }) => {
  const attrs = [
    `title="${title ?? 'Modal title'}"`,
    `size="${size ?? 'md'}"`,
    `trigger-label="${triggerLabel ?? 'Open modal'}"`,
  ].join(' ');

  return `
    <lui-modal ${attrs}>
      <p>This is the modal body text. It defines the main content of the modal.</p>
      <lui-button slot="actions" variant="secondary" label="Cancel" data-modal-close></lui-button>
      <lui-button slot="actions" label="Confirm"></lui-button>
    </lui-modal>
  `;
};

export const Default = Template.bind({});
Default.args = {
  title: 'Modal title',
  size: 'md',
  'trigger-label': 'Open modal',
};

export const Small = Template.bind({});
Small.args = {
  title: 'Small Modal',
  size: 'sm',
  'trigger-label': 'Open modal',
};

export const Large = Template.bind({});
Large.args = {
  title: 'Large Modal',
  size: 'lg',
  'trigger-label': 'Open modal',
};

export const WithoutActions = () => `
  <lui-modal title="Modal without actions" trigger-label="Open modal">
    <p>This modal has no footer actions.</p>
  </lui-modal>
`;
WithoutActions.storyName = 'Without actions';

export const CustomTrigger = () => `
  <lui-modal title="Modal with custom trigger">
    <lui-button slot="trigger" variant="secondary" label="Settings" icon-left="settings"></lui-button>
    <p>This modal uses a fully custom trigger via <code>slot="trigger"</code>.</p>
    <lui-button slot="actions" variant="secondary" label="Cancel" data-modal-close></lui-button>
    <lui-button slot="actions" label="Confirm"></lui-button>
  </lui-modal>
`;
CustomTrigger.storyName = 'Custom trigger (slot)';
