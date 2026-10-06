import type { PreviewConfig } from '@systembook/schema';
import { Sample, Stretch } from './demo';
import { elementProps } from './element';

// The children are assigned to numbered slots automatically. Below
// `threshold` the row becomes a column — resize the preview to see it flip.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-switcher {...elementProps(props)}>
        <Sample>One</Sample>
        <Sample>Two</Sample>
        <Sample>Three</Sample>
      </lui-switcher>
    </Stretch>
  );
}

export default {
  component: 'Switcher',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: { threshold: '320px', gap: '16' },
    },
    {
      id: 'limited',
      label: 'Limited to two',
      props: { threshold: '320px', gap: '16', limit: '2' },
    },
  ],
  controls: [
    { kind: 'text', propName: 'threshold', label: 'Threshold' },
    {
      kind: 'select',
      propName: 'gap',
      label: 'Gap',
      options: ['8', '16', '24', '32'],
      defaultValue: '16',
    },
    // Beyond this many items every child takes a full row, no matter the
    // available width.
    { kind: 'text', propName: 'limit', label: 'Limit' },
  ],
} satisfies PreviewConfig;
