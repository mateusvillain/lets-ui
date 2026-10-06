import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return (
    <lui-radio-group {...elementProps(props)}>
      <lui-radio label="Light" value="light" checked="" />
      <lui-radio label="Dark" value="dark" />
      <lui-radio label="Follow the system" value="system" />
    </lui-radio-group>
  );
}

export default {
  component: 'RadioGroup',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: { label: 'Theme', name: 'theme', size: 'lg' },
    },
    {
      id: 'hint',
      label: 'With hint',
      props: {
        label: 'Theme',
        name: 'theme',
        size: 'lg',
        hint: 'Applies to every page of the documentation.',
      },
    },
    {
      id: 'error',
      label: 'Error',
      props: {
        label: 'Theme',
        name: 'theme',
        size: 'lg',
        required: true,
        error: true,
        'error-text': 'Pick one of the options.',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
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
