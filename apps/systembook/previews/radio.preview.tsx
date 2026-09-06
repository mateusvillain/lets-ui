import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-radio {...elementProps(props)} />;
}

export default {
  component: 'Radio',
  variants: [
    {
      id: 'unselected',
      label: 'Unselected',
      props: { label: 'Light theme', value: 'light', size: 'lg' },
    },
    {
      id: 'selected',
      label: 'Selected',
      props: {
        label: 'Light theme',
        value: 'light',
        size: 'lg',
        checked: true,
      },
    },
  ],
  // A single radio is rarely used on its own — see the Radio Group preview for
  // the roving-focus behaviour a real group has.
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['lg', 'md'],
      defaultValue: 'lg',
    },
    {
      kind: 'boolean',
      propName: 'checked',
      label: 'Checked',
      defaultValue: false,
    },
    { kind: 'boolean', propName: 'error', label: 'Error', defaultValue: false },
    {
      kind: 'boolean',
      propName: 'disabled',
      label: 'Disabled',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
