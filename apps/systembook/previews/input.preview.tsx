import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-input {...elementProps(props)} />;
}

export default {
  component: 'Input',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: { label: 'Email', placeholder: 'you@example.com', size: 'lg' },
    },
    {
      id: 'hint',
      label: 'With hint',
      props: {
        label: 'Email',
        placeholder: 'you@example.com',
        hint: 'We only use it to sign you in.',
        size: 'lg',
      },
    },
    {
      id: 'error',
      label: 'Error',
      props: {
        label: 'Email',
        placeholder: 'you@example.com',
        error: true,
        'error-text': 'Enter a valid email address.',
        size: 'lg',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    { kind: 'text', propName: 'placeholder', label: 'Placeholder' },
    { kind: 'text', propName: 'hint', label: 'Hint' },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['lg', 'md'],
      defaultValue: 'lg',
    },
    {
      kind: 'boolean',
      propName: 'required',
      label: 'Required',
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
