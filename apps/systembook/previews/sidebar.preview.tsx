import type { PreviewConfig } from '@systembook/schema';
import { Sample, Stretch } from './demo';
import { elementProps } from './element';

// The two halves are named slots: the side keeps `side-width` until the
// content would drop below `content-min-width`, and then the pair wraps.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-sidebar {...elementProps(props)}>
        <Sample slot="sidebar">Navigation</Sample>
        <Sample slot="content" style={{ minHeight: '120px' }}>
          Page content
        </Sample>
      </lui-sidebar>
    </Stretch>
  );
}

export default {
  component: 'Sidebar',
  variants: [
    {
      id: 'start',
      label: 'Start',
      props: { side: 'start', 'side-width': '200px' },
    },
    { id: 'end', label: 'End', props: { side: 'end', 'side-width': '200px' } },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'side',
      label: 'Side',
      options: ['start', 'end'],
      defaultValue: 'start',
    },
    { kind: 'text', propName: 'side-width', label: 'Side width' },
    { kind: 'text', propName: 'content-min-width', label: 'Content min width' },
    {
      kind: 'select',
      propName: 'gap',
      label: 'Gap',
      options: ['8', '16', '24', '32'],
      defaultValue: '24',
    },
  ],
} satisfies PreviewConfig;
