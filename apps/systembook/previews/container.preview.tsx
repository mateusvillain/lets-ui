import type { PreviewConfig } from '@systembook/schema';
import { Sample, Stretch } from './demo';
import { elementProps } from './element';

// The size scale mirrors the breakpoint tokens, so the container and the
// CSS-only `.container` cannot drift apart.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-container {...elementProps(props)}>
        <Sample>Page content, held to the container width</Sample>
      </lui-container>
    </Stretch>
  );
}

export default {
  component: 'Container',
  variants: [
    { id: 'lg', label: 'Large', props: { size: 'lg', padding: '32' } },
    { id: 'sm', label: 'Small', props: { size: 'sm', padding: '32' } },
    { id: 'full', label: 'Full width', props: { size: 'full', padding: '32' } },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
      defaultValue: 'lg',
    },
    {
      kind: 'select',
      propName: 'padding',
      label: 'Padding',
      options: ['0', '16', '24', '32', '48'],
      defaultValue: '32',
    },
    {
      kind: 'boolean',
      propName: 'center',
      label: 'Centered',
      defaultValue: true,
    },
  ],
} satisfies PreviewConfig;
