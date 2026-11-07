import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-close-button {...elementProps(props)} />;
}

export default {
  component: 'CloseButton',
  variants: [
    { id: 'md', label: 'Medium', props: { size: 'md', label: 'Close' } },
    { id: 'lg', label: 'Large', props: { size: 'lg', label: 'Close' } },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Accessible name' },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
    },
    {
      kind: 'boolean',
      propName: 'disabled',
      label: 'Disabled',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
