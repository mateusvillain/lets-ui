import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

// `duration="0"` keeps the toast on screen: with the default 5s timer the
// preview would empty itself a moment after loading.
export function Preview(props: Record<string, unknown>) {
  return <lui-toast {...elementProps(props)} />;
}

export default {
  component: 'Toast',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: {
        variant: 'default',
        title: 'Draft saved',
        content: 'Your changes are stored locally.',
        duration: '0',
      },
    },
    {
      id: 'success',
      label: 'Success',
      props: {
        variant: 'success',
        title: 'Tokens published',
        content: 'Every page now reads the new revision.',
        duration: '0',
      },
    },
    {
      id: 'danger',
      label: 'Danger',
      props: {
        variant: 'danger',
        title: 'Publish failed',
        content: 'The token file could not be parsed.',
        duration: '0',
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
      options: ['default', 'success', 'danger'],
      defaultValue: 'default',
    },
    // Anything above 0 arms the auto-dismiss timer, and the toast removes
    // itself from the preview when it fires.
    { kind: 'text', propName: 'duration', label: 'Duration (ms)' },
  ],
} satisfies PreviewConfig;
