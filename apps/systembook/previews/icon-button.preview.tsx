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

// The `alert` glyph, for the toggle example: a filter that shows alerts reads
// better than an `x` that stays pressed.
function AlertIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 3.75C12.2724 3.75 12.5232 3.89789 12.6555 4.13599L20.1555 17.636C20.2844 17.8682 20.2813 18.1512 20.1467 18.3801C20.012 18.6092 19.7657 18.75 19.5 18.75H4.49998C4.23425 18.75 3.98802 18.6092 3.85325 18.3801C3.71869 18.1512 3.71554 17.8682 3.84447 17.636L11.3445 4.13599L11.3994 4.05103C11.5398 3.8632 11.7616 3.75 12 3.75ZM5.7744 17.25H18.2256L12 6.04395L5.7744 17.25ZM12 15C12.4142 15 12.75 15.3358 12.75 15.75C12.75 16.1642 12.4142 16.5 12 16.5C11.5858 16.5 11.25 16.1642 11.25 15.75C11.25 15.3358 11.5858 15 12 15ZM12 9C12.4142 9.00001 12.75 9.33579 12.75 9.75V13.5C12.75 13.9142 12.4142 14.25 12 14.25C11.5858 14.25 11.25 13.9142 11.25 13.5V9.75C11.25 9.33579 11.5858 9 12 9Z" />
    </svg>
  );
}

// `icon` picks the slotted glyph and is not forwarded to the element.
export function Preview({ icon, ...props }: Record<string, unknown>) {
  return (
    <lui-icon-button {...elementProps(props)}>
      {icon === 'alert' ? <AlertIcon /> : <CloseIcon />}
    </lui-icon-button>
  );
}

export default {
  component: 'IconButton',
  variants: [
    { id: 'md', label: 'Medium', props: { size: 'md', 'aria-label': 'Close' } },
    { id: 'lg', label: 'Large', props: { size: 'lg', 'aria-label': 'Close' } },
    {
      id: 'pressed',
      label: 'Pressed',
      props: {
        size: 'md',
        icon: 'alert',
        'aria-label': 'Show alerts',
        'aria-pressed': 'true',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'aria-label', label: 'Accessible name' },
    {
      kind: 'select',
      propName: 'aria-pressed',
      label: 'Pressed (toggle)',
      options: ['', 'false', 'true'],
      defaultValue: '',
    },
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
