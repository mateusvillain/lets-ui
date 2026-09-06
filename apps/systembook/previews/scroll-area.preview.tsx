import type { PreviewConfig } from '@systembook/schema';
import { Sample, Stretch } from './demo';
import { elementProps } from './element';

// Overflow, fade masks and the shadow indicators are all applied by
// JavaScript, so like Float this component lives only in the component
// package — a CSS-only stub would not work.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-scroll-area {...elementProps(props)}>
        <div style={{ display: 'grid', gap: '8px' }}>
          {Array.from({ length: 12 }, (_, i) => (
            <Sample key={i}>Row {i + 1}</Sample>
          ))}
        </div>
      </lui-scroll-area>
    </Stretch>
  );
}

export default {
  component: 'ScrollArea',
  variants: [
    {
      id: 'vertical',
      label: 'Vertical',
      props: { orientation: 'vertical', 'max-height': '240px' },
    },
    {
      id: 'shadow',
      label: 'With shadow',
      props: {
        orientation: 'vertical',
        'max-height': '240px',
        'scroll-shadow': true,
      },
    },
    {
      id: 'faded',
      label: 'Faded edges',
      props: {
        orientation: 'vertical',
        'max-height': '240px',
        fade: 'top,bottom',
      },
    },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'orientation',
      label: 'Orientation',
      options: ['vertical', 'horizontal', 'both'],
      defaultValue: 'vertical',
    },
    {
      kind: 'select',
      propName: 'scrollbar-visibility',
      label: 'Scrollbar',
      options: ['auto', 'always', 'hover', 'hidden'],
      defaultValue: 'auto',
    },
    { kind: 'text', propName: 'max-height', label: 'Max height' },
    // A comma-separated list of sides: top, bottom, left, right.
    { kind: 'text', propName: 'fade', label: 'Fade sides' },
    {
      kind: 'boolean',
      propName: 'scroll-shadow',
      label: 'Scroll shadow',
      defaultValue: false,
    },
    {
      kind: 'select',
      propName: 'overscroll',
      label: 'Overscroll',
      options: ['auto', 'contain', 'none'],
      defaultValue: 'auto',
    },
  ],
} satisfies PreviewConfig;
