import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-checkbox {...elementProps(props)} />;
}

export default {
  component: 'Checkbox',
  variants: [
    {
      id: 'unchecked',
      label: 'Unchecked',
      props: { label: 'Send me release notes', size: 'lg' },
    },
    {
      id: 'checked',
      label: 'Checked',
      props: { label: 'Send me release notes', size: 'lg', checked: true },
    },
    {
      id: 'error',
      label: 'Error',
      props: {
        label: 'Accept the terms',
        size: 'lg',
        required: true,
        error: true,
        'error-text': 'You have to accept the terms to continue.',
      },
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
