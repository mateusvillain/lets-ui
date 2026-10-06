import type { CSSProperties, ReactNode } from 'react';

/**
 * Placeholder content for the layout primitives — they only show what they do
 * once there is something inside them. Deliberately plain and not built from
 * design system components, so the primitive under preview stays the subject.
 */
export function Sample({
  children = 'Item',
  style,
  slot,
}: {
  children?: ReactNode;
  style?: CSSProperties;
  /** Named slot to place this into, for the primitives that use them. */
  slot?: string;
}) {
  return (
    <div
      slot={slot}
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        background: 'var(--lui-color-neutral-background-surface)',
        border: '1px solid var(--lui-color-neutral-border-default)',
        color: 'var(--lui-color-neutral-text-body)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * The preview page centres its content, which hides what a layout primitive
 * does with the space it is given. Wrapping one in this hands it the full
 * width of the iframe instead.
 */
export function Stretch({ children }: { children?: ReactNode }) {
  return <div style={{ width: '100%' }}>{children}</div>;
}
