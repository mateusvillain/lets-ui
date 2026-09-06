import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-button {...elementProps(props)} />;
}

export default {
  component: 'Button',
  variants: [
    {
      id: 'primary',
      label: 'Primary',
      props: { variant: 'primary', size: 'lg', label: 'Save' },
    },
    {
      id: 'secondary',
      label: 'Secondary',
      props: { variant: 'secondary', size: 'lg', label: 'Save' },
    },
    {
      id: 'danger',
      label: 'Danger',
      props: { variant: 'danger', size: 'lg', label: 'Delete' },
    },
    {
      id: 'loading',
      label: 'Loading',
      props: {
        variant: 'primary',
        size: 'lg',
        label: 'Save',
        loading: true,
        'loading-text': 'Saving…',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    {
      kind: 'select',
      propName: 'variant',
      label: 'Variant',
      options: ['primary', 'secondary', 'neutral', 'danger', 'success'],
      defaultValue: 'primary',
    },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['lg', 'md'],
      defaultValue: 'lg',
    },
    {
      kind: 'boolean',
      propName: 'disabled',
      label: 'Disabled',
      defaultValue: false,
    },
    {
      kind: 'boolean',
      propName: 'loading',
      label: 'Loading',
      defaultValue: false,
    },
    {
      kind: 'boolean',
      propName: 'block',
      label: 'Full width',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
