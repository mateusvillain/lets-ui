import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

// The tooltip content shows on hover or keyboard focus of the trigger — the
// preview starts with it hidden, as it is on a real page.
export function Preview(props: Record<string, unknown>) {
  return <lui-tooltip {...elementProps(props)} />;
}

export default {
  component: 'Tooltip',
  variants: [
    {
      id: 'top',
      label: 'Top',
      props: {
        label: 'What is a token?',
        text: 'A value that varies by brand or theme.',
        position: 'top',
      },
    },
    {
      id: 'bottom',
      label: 'Bottom',
      props: {
        label: 'What is a token?',
        text: 'A value that varies by brand or theme.',
        position: 'bottom',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Trigger label' },
    { kind: 'text', propName: 'text', label: 'Tooltip text' },
    {
      kind: 'select',
      propName: 'position',
      label: 'Position',
      options: ['top', 'bottom', 'left', 'right'],
      defaultValue: 'top',
    },
  ],
} satisfies PreviewConfig;
