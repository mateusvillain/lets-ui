import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

// The menu reads its items from the `items` slot and re-renders them inside a
// `role="menu"` list, so the slotted `lui-menu-item` elements are declarative
// data rather than what you see on screen. A nested item builds a submenu.
export function Preview(props: Record<string, unknown>) {
  return (
    <lui-dropdown-menu {...elementProps(props)}>
      <lui-button slot="trigger" variant="secondary" size="md" label="File" />
      <lui-menu-item slot="items" label="New file" shortcut="⌘,N" />
      <lui-menu-item slot="items" label="Open" shortcut="⌘,O" />
      <lui-menu-divider slot="items" />
      <lui-menu-item slot="items" label="Export as">
        <lui-menu-item label="PDF" />
        <lui-menu-item label="PNG" />
        <lui-menu-item label="SVG" />
      </lui-menu-item>
      <lui-menu-divider slot="items" />
      <lui-menu-item slot="items" label="Delete" variant="danger" />
    </lui-dropdown-menu>
  );
}

export default {
  component: 'DropdownMenu',
  variants: [
    { id: 'closed', label: 'Closed', props: {} },
    { id: 'open', label: 'Open', props: { open: true } },
  ],
  controls: [
    { kind: 'boolean', propName: 'open', label: 'Open', defaultValue: false },
  ],
} satisfies PreviewConfig;
