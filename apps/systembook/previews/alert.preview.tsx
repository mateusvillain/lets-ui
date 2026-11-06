import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-alert {...elementProps(props)} />;
}

export default {
  component: 'Alert',
  variants: [
    {
      id: 'success',
      label: 'Success',
      props: {
        variant: 'success',
        title: 'Changes saved',
        content: 'Your brand tokens were published.',
      },
    },
    {
      id: 'danger',
      label: 'Danger',
      props: {
        variant: 'danger',
        title: 'Publish failed',
        content: 'The token file could not be parsed.',
        dismissible: true,
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'title', label: 'Title' },
    { kind: 'text', propName: 'content', label: 'Content' },
    {
      kind: 'select',
      propName: 'variant',
      label: 'Variant',
      options: ['success', 'info', 'caution', 'danger'],
      defaultValue: 'success',
    },
    {
      kind: 'boolean',
      propName: 'dismissible',
      label: 'Dismissible',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
