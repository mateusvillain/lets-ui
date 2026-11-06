import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

// Not a component: a small composition for the Introduction page, so the
// first thing a reader sees is the system working as a whole — typography, a
// form field and actions on one surface.
export function Preview(props: Record<string, unknown>) {
  return (
    <div {...elementProps(props)} style={{ width: 'min(100%, 420px)' }}>
      <lui-card aria-label="Newsletter">
        <lui-stack gap="16">
          <lui-stack gap="4">
            <lui-heading label="Stay in the loop" variant="block-title" />
            <lui-body
              label="One email a month with what changed in the system."
              variant="sm"
            />
          </lui-stack>
          <lui-input
            label="Email"
            type="email"
            placeholder="you@example.com"
            size="md"
          />
        </lui-stack>
        <lui-button slot="actions" variant="primary" size="md" label="Subscribe" />
      </lui-card>
    </div>
  );
}

export default {
  component: 'Showcase',
  variants: [{ id: 'default', label: 'Default', props: {} }],
  controls: [],
} satisfies PreviewConfig;
