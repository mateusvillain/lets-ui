import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return (
    <lui-modal {...elementProps(props)}>
      <p>
        Publishing replaces the token file every page of the documentation reads
        from. The previous revision stays available.
      </p>
    </lui-modal>
  );
}

export default {
  component: 'Modal',
  variants: [
    {
      id: 'closed',
      label: 'Closed',
      props: {
        title: 'Publish tokens',
        'trigger-label': 'Publish',
        size: 'md',
      },
    },
    {
      id: 'open',
      label: 'Open',
      props: {
        title: 'Publish tokens',
        'trigger-label': 'Publish',
        size: 'md',
        open: true,
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'title', label: 'Title' },
    { kind: 'text', propName: 'trigger-label', label: 'Trigger label' },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['sm', 'md', 'lg', 'xl'],
      defaultValue: 'md',
    },
    { kind: 'boolean', propName: 'open', label: 'Open', defaultValue: false },
    {
      kind: 'boolean',
      propName: 'hide-trigger',
      label: 'Hide trigger',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
