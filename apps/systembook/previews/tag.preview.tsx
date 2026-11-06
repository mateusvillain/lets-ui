import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-tag {...elementProps(props)} />;
}

export default {
  component: 'Tag',
  variants: [
    {
      id: 'surface',
      label: 'Surface',
      props: {
        label: 'Active',
        'tag-style': 'surface',
        variant: 'success',
        size: 'md',
      },
    },
    {
      id: 'container',
      label: 'Container',
      props: {
        label: 'Active',
        'tag-style': 'container',
        variant: 'success',
        size: 'md',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    {
      kind: 'select',
      propName: 'tag-style',
      label: 'Style',
      options: ['surface', 'container'],
      defaultValue: 'surface',
    },
    {
      kind: 'select',
      propName: 'variant',
      label: 'Variant',
      options: ['primary', 'caution', 'danger', 'success', 'neutral'],
      defaultValue: 'success',
    },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['sm', 'md', 'lg', 'xl'],
      defaultValue: 'md',
    },
    {
      kind: 'boolean',
      propName: 'circle',
      label: 'Circle',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
