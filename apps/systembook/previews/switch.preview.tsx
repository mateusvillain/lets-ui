import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-switch {...elementProps(props)} />;
}

export default {
  component: 'Switch',
  variants: [
    { id: 'off', label: 'Off', props: { label: 'Dark theme', size: 'lg' } },
    {
      id: 'on',
      label: 'On',
      props: { label: 'Dark theme', size: 'lg', checked: true },
    },
  ],
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
