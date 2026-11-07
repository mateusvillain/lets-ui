import type { PreviewConfig } from '@systembook/schema';
import { Stretch } from './demo';
import { elementProps } from './element';

// `demo` picks a composition instead of a single bone; it is not an attribute
// of lui-skeleton, so it is taken out before the rest reaches the element.
export function Preview({ demo, ...props }: Record<string, unknown>) {
  if (demo === 'card') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading article"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '280px',
        }}
      >
        <lui-skeleton shape="rectangle" height="140px" />
        <lui-skeleton width="80%" />
        <lui-skeleton />
        <lui-skeleton width="56%" />
      </div>
    );
  }

  if (demo === 'list') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading contacts"
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <lui-skeleton shape="circle" />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '200px',
              }}
            >
              <lui-skeleton width="64%" />
              <lui-skeleton width="40%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Stretch>
      <lui-skeleton {...elementProps(props)} />
    </Stretch>
  );
}

export default {
  component: 'Skeleton',
  variants: [
    { id: 'text', label: 'Text', props: { shape: 'text', width: '64%' } },
    { id: 'circle', label: 'Circle', props: { shape: 'circle' } },
    {
      id: 'rectangle',
      label: 'Rectangle',
      props: { shape: 'rectangle', height: '160px' },
    },
    { id: 'card', label: 'Card', props: { demo: 'card' } },
    { id: 'list', label: 'List item', props: { demo: 'list' } },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'shape',
      label: 'Shape',
      options: ['text', 'circle', 'rectangle'],
      defaultValue: 'text',
    },
    { kind: 'text', propName: 'width', label: 'Width' },
    { kind: 'text', propName: 'height', label: 'Height' },
    { kind: 'text', propName: 'label', label: 'Label' },
  ],
} satisfies PreviewConfig;
