import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return (
    <lui-drawer {...elementProps(props)}>
      <p>
        Every brand keeps its own palette, radii and typography scale. Switching
        brands re-resolves them without a rebuild.
      </p>
    </lui-drawer>
  );
}

export default {
  component: 'Drawer',
  variants: [
    {
      id: 'closed',
      label: 'Closed',
      props: {
        title: 'Brand settings',
        'trigger-label': 'Open settings',
        size: 'md',
      },
    },
    {
      id: 'open',
      label: 'Open',
      props: {
        title: 'Brand settings',
        'trigger-label': 'Open settings',
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
