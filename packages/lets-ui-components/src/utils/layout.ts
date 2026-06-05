export const SPACE: Record<string, string> = {
  none: '0',
  xs: 'var(--lui-spacing-fluid-4)',
  sm: 'var(--lui-spacing-fluid-8)',
  md: 'var(--lui-spacing-fluid-16)',
  lg: 'var(--lui-spacing-fluid-24)',
  xl: 'var(--lui-spacing-fluid-32)',
  '2xl': 'var(--lui-spacing-fluid-48)',
};

export function resolveSpace(value: string | undefined | null): string | null {
  if (!value) return null;
  return SPACE[value] ?? value;
}

export const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
  baseline: 'baseline',
};

export const JUSTIFY_MAP: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};
