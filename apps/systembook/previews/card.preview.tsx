import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return (
    <lui-card {...elementProps(props)}>
      <lui-stack gap="8">
        <lui-heading label="Colour tokens" variant="block-title" />
        <lui-body
          label="Every brand resolves the same semantic roles to its own palette."
          variant="sm"
        />
      </lui-stack>
    </lui-card>
  );
}

export default {
  component: 'Card',
  variants: [{ id: 'default', label: 'Default', props: {} }],
  controls: [
    { kind: 'text', propName: 'aria-label', label: 'Accessible name' },
  ],
} satisfies PreviewConfig;
