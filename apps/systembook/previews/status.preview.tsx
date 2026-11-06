import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-status {...elementProps(props)} />;
}

export default {
  component: 'Status',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: { variant: 'success', label: 'Payment approved' },
    },
    {
      id: 'description',
      label: 'With description',
      props: {
        variant: 'danger',
        label: 'Sync failed',
        description: '5 minutes ago',
      },
    },
    {
      id: 'dot',
      label: 'Dot',
      props: { variant: 'caution', dot: true, label: 'Pending review' },
    },
    {
      id: 'social',
      label: 'Social',
      props: { variant: 'online', label: 'Online' },
    },
    {
      id: 'pulse',
      label: 'Pulse',
      props: { variant: 'danger', dot: true, pulse: true, label: 'Recording' },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    { kind: 'text', propName: 'description', label: 'Description' },
    {
      kind: 'select',
      propName: 'variant',
      label: 'Variant',
      options: [
        'success',
        'caution',
        'danger',
        'info',
        'online',
        'away',
        'busy',
        'offline',
      ],
      defaultValue: 'success',
    },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['md', 'lg'],
      defaultValue: 'md',
    },
    { kind: 'boolean', propName: 'dot', label: 'Dot', defaultValue: false },
    { kind: 'boolean', propName: 'pulse', label: 'Pulse', defaultValue: false },
    {
      kind: 'boolean',
      propName: 'hide-label',
      label: 'Hide label',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
