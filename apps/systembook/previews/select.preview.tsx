import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-select {...elementProps(props)} />;
}

export default {
  component: 'Select',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: {
        label: 'Brand',
        // `options` is a comma-separated list, not an array attribute.
        options: 'Let’s UI,Acme,Globex',
        placeholder: 'Pick a brand',
        size: 'lg',
      },
    },
    {
      id: 'hint',
      label: 'With hint',
      props: {
        label: 'Brand',
        options: 'Let’s UI,Acme,Globex',
        placeholder: 'Pick a brand',
        hint: 'Drives the data-brand attribute on the page.',
        size: 'lg',
      },
    },
    {
      id: 'error',
      label: 'Error',
      props: {
        label: 'Brand',
        options: 'Let’s UI,Acme,Globex',
        placeholder: 'Pick a brand',
        required: true,
        error: true,
        'error-text': 'Pick a brand to continue.',
        size: 'lg',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    { kind: 'text', propName: 'options', label: 'Options (comma separated)' },
    { kind: 'text', propName: 'placeholder', label: 'Placeholder' },
    { kind: 'text', propName: 'hint', label: 'Hint' },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['lg', 'md'],
      defaultValue: 'lg',
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
