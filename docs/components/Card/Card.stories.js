import '../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../packages/styles/dist/letsui.css';
import '../../../packages/lets-ui-components/src/index.js';

export default {
  title: 'Content/Card',
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
    cover: { control: 'boolean' },
    primaryButton: { control: 'text' },
    secondaryButton: { control: 'text' },
  },
};

const coverPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23e5e7eb'/%3E%3C/svg%3E";

const Template = ({
  title,
  content,
  cover,
  primaryButton,
  secondaryButton,
}) => `
  <div style="width: 320px;">
    <lui-card>
      ${cover ? `<img slot="cover" src="${coverPlaceholder}" alt="">` : ''}
      ${title ? `<p class="body--lg" style="font-weight:600">${title}</p>` : ''}
      ${content ? `<p class="body--lg">${content}</p>` : ''}
      ${secondaryButton ? `<button slot="actions" class="btn btn--secondary btn--lg">${secondaryButton}</button>` : ''}
      ${primaryButton ? `<button slot="actions" class="btn btn--primary btn--lg">${primaryButton}</button>` : ''}
    </lui-card>
  </div>
`;

const baseArgs = {
  title: 'Card title',
  content: 'Card description goes here.',
  cover: false,
  primaryButton: '',
  secondaryButton: '',
};

export const Card = Template.bind({});
Card.args = { ...baseArgs };

export const WithCover = Template.bind({});
WithCover.args = { ...baseArgs, cover: true };

export const WithActions = Template.bind({});
WithActions.args = {
  ...baseArgs,
  primaryButton: 'Confirm',
  secondaryButton: 'Cancel',
};

export const Full = Template.bind({});
Full.args = {
  ...baseArgs,
  cover: true,
  primaryButton: 'Confirm',
  secondaryButton: 'Cancel',
};
