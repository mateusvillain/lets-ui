import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-heading {...elementProps(props)} />;
}

export default {
  component: 'Heading',
  variants: [
    {
      id: 'title',
      label: 'Title',
      props: { label: 'Design tokens', variant: 'title' },
    },
    {
      id: 'display',
      label: 'Display',
      props: { label: 'Let’s UI', variant: 'display' },
    },
    {
      id: 'overtitle',
      label: 'Overtitle',
      props: {
        label: 'Foundations',
        variant: 'overtitle',
        transform: 'uppercase',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Text' },
    {
      kind: 'select',
      propName: 'variant',
      label: 'Variant',
      options: [
        'display',
        'title',
        'subtitle',
        'headline',
        'subheadline',
        'block-title',
        'overtitle',
      ],
      defaultValue: 'title',
    },
    {
      kind: 'select',
      propName: 'align',
      label: 'Align',
      options: ['left', 'center', 'right', 'justify'],
      defaultValue: 'left',
    },
    {
      kind: 'select',
      propName: 'transform',
      label: 'Transform',
      options: ['none', 'uppercase', 'lowercase', 'capitalize'],
      defaultValue: 'none',
    },
  ],
} satisfies PreviewConfig;
