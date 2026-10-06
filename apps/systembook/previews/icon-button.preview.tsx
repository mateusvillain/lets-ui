import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

// The icon is slotted content, not a prop: the component styles whatever it is
// handed. This is the `x` glyph from lets-ui-icons, inlined so the preview
// carries no external request.
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.4697 5.46973C17.7626 5.17683 18.2373 5.17683 18.5302 5.46973C18.8231 5.76262 18.8231 6.23738 18.5302 6.53027L13.0605 12L18.5302 17.4697C18.8231 17.7626 18.8231 18.2374 18.5302 18.5303C18.2373 18.8232 17.7626 18.8232 17.4697 18.5303L11.9999 13.0605L6.53022 18.5303C6.23732 18.8232 5.76256 18.8232 5.46967 18.5303C5.17678 18.2374 5.17678 17.7626 5.46967 17.4697L10.9394 12L5.46967 6.53027C5.17678 6.23738 5.17678 5.76262 5.46967 5.46973C5.76256 5.17683 6.23732 5.17683 6.53022 5.46973L11.9999 10.9395L17.4697 5.46973Z" />
    </svg>
  );
}

export function Preview(props: Record<string, unknown>) {
  return (
    <lui-icon-button {...elementProps(props)}>
      <CloseIcon />
    </lui-icon-button>
  );
}

export default {
  component: 'IconButton',
  variants: [
    { id: 'md', label: 'Medium', props: { size: 'md', 'aria-label': 'Close' } },
    { id: 'lg', label: 'Large', props: { size: 'lg', 'aria-label': 'Close' } },
  ],
  controls: [
    { kind: 'text', propName: 'aria-label', label: 'Accessible name' },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['sm', 'md', 'lg', 'xl'],
      defaultValue: 'md',
    },
    {
      kind: 'boolean',
      propName: 'disabled',
      label: 'Disabled',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
