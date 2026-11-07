import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-textarea {...elementProps(props)} />;
}

export default {
  component: 'Textarea',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: {
        label: 'Release notes',
        placeholder: 'What changed in this version?',
        rows: '4',
        size: 'lg',
      },
    },
    {
      id: 'error',
      label: 'Error',
      props: {
        label: 'Release notes',
        placeholder: 'What changed in this version?',
        rows: '4',
        size: 'lg',
        required: true,
        error: true,
        'error-text': 'Describe the change before publishing.',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    { kind: 'text', propName: 'placeholder', label: 'Placeholder' },
    { kind: 'text', propName: 'hint', label: 'Hint' },
    { kind: 'text', propName: 'rows', label: 'Rows' },
    {
      kind: 'select',
      propName: 'resize',
      label: 'Resize',
      options: ['vertical', 'both', 'none'],
      defaultValue: 'vertical',
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
