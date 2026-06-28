import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Content/Alert',
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['caution', 'danger', 'info', 'success'],
    },
    title: { control: 'text' },
    content: { control: 'text' },
    dismissible: {
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    closeLabel: {
      control: 'text',
      name: 'close-label',
    },
  },
};

const Template = ({ variant, title, content, dismissible, closeLabel }) => `
  <lui-alert
    variant="${variant ?? 'success'}"
    title="${title ?? ''}"
    content="${content ?? ''}"
    ${dismissible ? 'dismissible' : ''}
    ${closeLabel ? `close-label="${closeLabel}"` : ''}
  >
    <button slot="actions" class="btn btn--secondary btn--lg">Dismiss</button>
    <button slot="actions" class="btn btn--primary btn--lg">Action</button>
  </lui-alert>
`;

const baseArgs = {
  variant: 'success',
  title: 'Alert title',
  content: 'Description',
  dismissible: false,
  closeLabel: 'Close',
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

export const Dismissible = ({ variant, title, content, closeLabel }) => `
  <lui-alert
    variant="${variant ?? 'info'}"
    title="${title ?? 'Alert title'}"
    content="${content ?? 'This alert can be dismissed by clicking the close button.'}"
    dismissible
    close-label="${closeLabel ?? 'Close'}"
  ></lui-alert>
`;
Dismissible.args = {
  variant: 'info',
  title: 'Alert title',
  content: 'This alert can be dismissed by clicking the close button.',
  closeLabel: 'Close',
};
Dismissible.argTypes = {
  dismissible: { table: { disable: true } },
};

export const DismissibleWithActions = () => `
  <lui-alert
    variant="caution"
    title="Unsaved changes"
    content="You have unsaved changes. Do you want to save before leaving?"
    dismissible
    close-label="Discard changes"
  >
    <button slot="actions" class="btn btn--secondary btn--lg">Cancel</button>
    <button slot="actions" class="btn btn--primary btn--lg">Save</button>
  </lui-alert>
`;
DismissibleWithActions.storyName = 'Dismissible with actions';
DismissibleWithActions.parameters = { controls: { disable: true } };

export const DismissibleAllVariants = () => `
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <lui-alert variant="success" title="Success" content="Your changes have been saved." dismissible></lui-alert>
    <lui-alert variant="caution" title="Caution" content="Please review the information before proceeding." dismissible></lui-alert>
    <lui-alert variant="danger" title="Danger" content="This action cannot be undone." dismissible></lui-alert>
    <lui-alert variant="info" title="Info" content="A new version is available." dismissible></lui-alert>
  </div>
`;
DismissibleAllVariants.storyName = 'Dismissible — all variants';
DismissibleAllVariants.parameters = { controls: { disable: true } };

export const WithoutActions = () => `
  <lui-alert
    variant="success"
    title="Alert sem ações"
    content="Este alert não possui botões de ação."
  ></lui-alert>
`;
WithoutActions.storyName = 'Without actions';

export const CSSClass = () => `
  <div class="alert alert--info">
    <div class="alert__content">
      <div class="alert__text">
        <p>Informação importante</p>
      </div>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
