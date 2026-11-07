import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-shortcut {...elementProps(props)} />;
}

export default {
  component: 'Shortcut',
  variants: [
    { id: 'single', label: 'Single key', props: { keys: 'Esc' } },
    { id: 'combo', label: 'Combination', props: { keys: '⌘,Shift,P' } },
  ],
  // `keys` is a comma-separated list — each entry renders as its own <kbd>.
  controls: [{ kind: 'text', propName: 'keys', label: 'Keys' }],
} satisfies PreviewConfig;
