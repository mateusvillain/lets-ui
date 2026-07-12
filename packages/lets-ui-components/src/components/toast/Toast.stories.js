import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Content/Toast',
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'danger'],
    },
    title: { control: 'text' },
    content: {
      control: 'text',
      description:
        'Secondary description. These stories pass it through the default slot (the recommended way) — see "Content via attribute" for the `content=""` prop equivalent.',
    },
    duration: { control: 'number' },
    closeLabel: {
      control: 'text',
      name: 'close-label',
    },
    action: {
      control: { type: 'select' },
      options: ['none', 'button'],
      description:
        'Toggle between the default close (×) button and a custom action button (via the `action` slot).',
    },
  },
};

// Story args are interpolated into raw HTML below. Attributes are wrapped in
// double quotes — escape `&`/`"` so a value containing a literal quote can't
// terminate the attribute early. Text nodes only need `&`/`</>` escaped.
const escapeAttr = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// `content` is passed through the default slot here — the recommended way to
// supply the description in real usage. See the `ContentAttribute` story for
// the `content=""` attribute equivalent.
const Template = ({
  variant,
  title,
  content,
  duration,
  closeLabel,
  action,
}) => `
  <div class="toast-region" role="region" aria-label="Notifications" style="position: static; transform: none;">
    <lui-toast
      variant="${escapeAttr(variant ?? 'default')}"
      title="${escapeAttr(title ?? '')}"
      duration="${duration ?? 5000}"
      ${closeLabel ? `close-label="${escapeAttr(closeLabel)}"` : ''}
    >
      ${escapeHtml(content ?? '')}
      ${action === 'button' ? `<lui-button slot="action" variant="primary" size="md" label="Button"></lui-button>` : ''}
    </lui-toast>
  </div>
`;

const baseArgs = {
  variant: 'default',
  title: 'New comment on your post',
  content: 'Priya replied: "Looks great, ready to ship!"',
  duration: 5000,
  closeLabel: 'Close',
  action: 'none',
};

export const Toast = Template.bind({});
Toast.args = { ...baseArgs };

export const Default = Template.bind({});
Default.args = {
  ...baseArgs,
  variant: 'default',
  title: 'Backup completed',
  content: 'Your project files were backed up to the cloud.',
};

export const Success = Template.bind({});
Success.args = {
  ...baseArgs,
  variant: 'success',
  title: 'Payment received',
  content: 'Invoice #1042 was paid by Acme Corp.',
};

export const Danger = Template.bind({});
Danger.args = {
  ...baseArgs,
  variant: 'danger',
  title: 'Upload failed',
  content: 'network-config.yaml could not be uploaded. Check your connection.',
};

export const CustomIcon = () => `
  <div class="toast-region" role="region" aria-label="Notifications" style="position: static; transform: none;">
    <lui-toast
      variant="default"
      title="New follower"
      duration="0"
    >
      Ana started following you.
      <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM4 20a8 8 0 1 1 16 0v1H4v-1Z" clip-rule="evenodd" />
      </svg>
    </lui-toast>
  </div>
`;
CustomIcon.storyName = 'Custom icon (icon slot)';
CustomIcon.parameters = { controls: { disable: true } };

export const SlottedContent = () => `
  <div class="toast-region" role="region" aria-label="Notifications" style="position: static; transform: none;">
    <lui-toast variant="success" title="Changes saved" duration="0">
      Your <strong>profile</strong> was updated. <a href="#">View changes</a>.
    </lui-toast>
  </div>
`;
SlottedContent.storyName = 'Slotted content with rich markup';
SlottedContent.parameters = { controls: { disable: true } };

export const ContentAttribute = () => `
  <div class="toast-region" role="region" aria-label="Notifications" style="position: static; transform: none;">
    <lui-toast
      variant="default"
      title="Item removed"
      content="${escapeAttr('The item was removed from your cart.')}"
      duration="0"
    ></lui-toast>
  </div>
`;
ContentAttribute.storyName = 'Content via attribute (content="")';
ContentAttribute.parameters = { controls: { disable: true } };

export const AutoDismiss = Template.bind({});
AutoDismiss.args = {
  ...baseArgs,
  variant: 'success',
  title: 'Draft saved',
  content: 'Your draft syncs automatically every few seconds.',
  duration: 2000,
};
AutoDismiss.argTypes = { duration: { table: { disable: true } } };

export const Persistent = Template.bind({});
Persistent.args = {
  ...baseArgs,
  variant: 'default',
  title: 'Low disk space',
  content:
    "You're almost out of storage. This message stays until you close it.",
  duration: 0,
};
Persistent.storyName = 'Persistent (duration="0")';

export const DangerNeverAutoDismisses = Template.bind({});
DangerNeverAutoDismisses.args = {
  ...baseArgs,
  variant: 'danger',
  title: 'Payment failed',
  content:
    "We couldn't charge your card ending in 4242. Update your payment method.",
  duration: 1000,
};
DangerNeverAutoDismisses.storyName = 'Danger never auto-dismisses';

export const WithAction = () => `
  <div class="toast-region" role="region" aria-label="Notifications" style="position: static; transform: none;">
    <lui-toast
      variant="default"
      title="Meeting invite"
      duration="0"
    >
      Jordan invited you to "Q3 Planning" on Thursday at 2 PM.
      <lui-button slot="action" variant="primary" size="md" label="Accept"></lui-button>
    </lui-toast>
  </div>
`;
WithAction.storyName = 'With action (replaces close button)';
WithAction.parameters = { controls: { disable: true } };

export const WithActionAllVariants = () => `
  <div class="toast-region" role="region" aria-label="Notifications" style="position: static; transform: none; display: flex; flex-direction: column; gap: 16px;">
    <lui-toast variant="default" title="Meeting invite" duration="0">
      Jordan invited you to "Q3 Planning" on Thursday at 2 PM.
      <lui-button slot="action" variant="primary" size="md" label="Accept"></lui-button>
    </lui-toast>
    <lui-toast variant="success" title="Deploy finished" duration="0">
      v2.4.0 was deployed to production successfully.
      <lui-button slot="action" variant="success" size="md" label="View"></lui-button>
    </lui-toast>
    <lui-toast variant="danger" title="Deploy failed" duration="0">
      v2.4.0 failed to deploy. Rollback may be required.
      <lui-button slot="action" variant="danger" size="md" label="Retry"></lui-button>
    </lui-toast>
  </div>
`;
WithActionAllVariants.storyName = 'With action — all variants';
WithActionAllVariants.parameters = { controls: { disable: true } };

export const Stacked = () => `
  <div class="toast-region" role="region" aria-label="Notifications" style="position: static; transform: none; height: 160px;">
    <lui-toast variant="default" title="New message" duration="0">Alex: "Are we still on for 3pm?"</lui-toast>
    <lui-toast variant="default" title="New like" duration="0">Sam liked your photo.</lui-toast>
    <lui-toast variant="default" title="New comment" duration="0">Priya commented on your post.</lui-toast>
  </div>
`;
Stacked.storyName = 'Stacked (collapsed, scales to 95%)';
Stacked.parameters = { controls: { disable: true } };

export const XSSSafeContent = () => `
  <div class="toast-region" role="region" aria-label="Notifications" style="position: static; transform: none;">
    <lui-toast
      variant="default"
      title="${escapeAttr('<img src=x onerror=alert(1)>')}"
      content="${escapeAttr('<b>bold?</b> rendered as literal text, not markup.')}"
      duration="0"
    ></lui-toast>
  </div>
`;
XSSSafeContent.storyName = 'XSS-safe content (content attribute)';
XSSSafeContent.parameters = { controls: { disable: true } };

export const CSSClass = () => `
  <div class="toast">
    <div class="toast__text">
      <p>Informação importante</p>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
