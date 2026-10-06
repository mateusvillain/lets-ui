import type { PreviewConfig } from '@systembook/schema';
import { Sample } from './demo';
import { elementProps } from './element';

// The default slot is the anchor; whatever goes in the `float` slot is pinned
// to it. The coordinates are applied by JavaScript, which is why this
// component has no CSS-only counterpart in `@lets-ui/styles`.
export function Preview(props: Record<string, unknown>) {
  return (
    <lui-float {...elementProps(props)}>
      <Sample style={{ padding: '24px 32px' }}>Anchor</Sample>
      <lui-tag
        slot="float"
        label="3"
        tag-style="container"
        variant="danger"
        size="sm"
        circle=""
      />
    </lui-float>
  );
}

export default {
  component: 'Float',
  variants: [
    { id: 'top-end', label: 'Top end', props: { placement: 'top-end' } },
    {
      id: 'bottom-end',
      label: 'Bottom end',
      props: { placement: 'bottom-end' },
    },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'placement',
      label: 'Placement',
      options: [
        'top-start',
        'top-center',
        'top-end',
        'middle-start',
        'middle-center',
        'middle-end',
        'bottom-start',
        'bottom-center',
        'bottom-end',
      ],
      defaultValue: 'bottom-end',
    },
    // A bare number is read as pixels; anything else passes through as a raw
    // CSS length.
    { kind: 'text', propName: 'offset-x', label: 'Offset X' },
    { kind: 'text', propName: 'offset-y', label: 'Offset Y' },
  ],
} satisfies PreviewConfig;
