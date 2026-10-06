import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-body {...elementProps(props)} />;
}

export default {
  component: 'Body',
  variants: [
    {
      id: 'md',
      label: 'Medium',
      props: {
        label:
          'Tokens are defined in JSON and compiled into CSS custom properties.',
        variant: 'md',
      },
    },
    {
      id: 'lg',
      label: 'Large',
      props: {
        label:
          'Tokens are defined in JSON and compiled into CSS custom properties.',
        variant: 'lg',
      },
    },
    {
      id: 'sm',
      label: 'Small',
      props: {
        label:
          'Tokens are defined in JSON and compiled into CSS custom properties.',
        variant: 'sm',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Text' },
    {
      kind: 'select',
      propName: 'variant',
      label: 'Size',
      options: ['lg', 'md', 'sm'],
      defaultValue: 'md',
    },
    {
      kind: 'select',
      propName: 'align',
      label: 'Align',
      options: ['left', 'center', 'right', 'justify'],
      defaultValue: 'left',
    },
    { kind: 'boolean', propName: 'bold', label: 'Bold', defaultValue: false },
    {
      kind: 'boolean',
      propName: 'italic',
      label: 'Italic',
      defaultValue: false,
    },
    {
      kind: 'boolean',
      propName: 'underline',
      label: 'Underline',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
