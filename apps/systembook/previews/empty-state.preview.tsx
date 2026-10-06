import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

// The cover is drawn with token-backed colours rather than a static asset, so
// it follows the theme instead of needing one file per theme.
function Cover() {
  return (
    <svg
      slot="cover"
      width="200"
      height="140"
      viewBox="0 0 240 180"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="120"
        cy="166"
        rx="70"
        ry="8"
        fill="var(--lui-color-neutral-background-container, #c7cad4)"
        opacity="0.5"
      />
      <g
        fill="var(--lui-color-neutral-background-container, #c7cad4)"
        stroke="var(--lui-color-neutral-border-default, #6c7081)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      >
        <path d="M62 114 32 102l8-16 28 14z" />
        <path d="M178 114l30-12-8-16-28 14z" />
        <path d="M60 112h120l-10 44a6 6 0 0 1-6 5H76a6 6 0 0 1-6-5z" />
      </g>
    </svg>
  );
}

export function Preview(props: Record<string, unknown>) {
  return (
    <lui-empty-state {...elementProps(props)}>
      <Cover />
      <lui-button
        slot="actions"
        variant="primary"
        size="md"
        label="Create a token"
      />
      <lui-button
        slot="actions"
        variant="neutral"
        size="md"
        label="Read the guide"
      />
    </lui-empty-state>
  );
}

export default {
  component: 'EmptyState',
  variants: [
    {
      id: 'center',
      label: 'Centered',
      props: {
        align: 'center',
        title: 'No tokens yet',
        description: 'Create the first token to start documenting this brand.',
      },
    },
    {
      id: 'left',
      label: 'Left aligned',
      props: {
        align: 'left',
        title: 'No tokens yet',
        description: 'Create the first token to start documenting this brand.',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'title', label: 'Title' },
    { kind: 'text', propName: 'description', label: 'Description' },
    {
      kind: 'select',
      propName: 'align',
      label: 'Align',
      options: ['center', 'left'],
      defaultValue: 'center',
    },
    {
      kind: 'select',
      propName: 'title-level',
      label: 'Title level',
      options: ['1', '2', '3', '4', '5', '6'],
      defaultValue: '2',
    },
    // `polite`/`assertive` give the block a live region — for an empty state
    // that appears after an action, not on first paint.
    {
      kind: 'select',
      propName: 'announce',
      label: 'Announce',
      options: ['off', 'polite', 'assertive'],
      defaultValue: 'off',
    },
  ],
} satisfies PreviewConfig;
