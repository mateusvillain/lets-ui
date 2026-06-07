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

export const RADIUS: Record<string, string> = {
  none: 'var(--lui-border-radius-none)',
  xs: 'var(--lui-border-radius-xs)',
  sm: 'var(--lui-border-radius-sm)',
  md: 'var(--lui-border-radius-md)',
  lg: 'var(--lui-border-radius-lg)',
  xl: 'var(--lui-border-radius-xl)',
  circle: 'var(--lui-border-radius-circle)',
};

export function resolveRadius(value: string | undefined | null): string | null {
  if (!value) return null;
  return RADIUS[value] ?? value;
}

export const BORDER_WIDTH: Record<string, string> = {
  '0': 'var(--lui-border-width-0)',
  '1': 'var(--lui-border-width-1)',
  '2': 'var(--lui-border-width-2)',
  '4': 'var(--lui-border-width-4)',
};

export function resolveBorderWidth(
  value: string | undefined | null
): string | null {
  if (!value) return null;
  return BORDER_WIDTH[value] ?? value;
}

// Semantic background aliases: {category}/{variant} → CSS custom property.
// Raw CSS values (e.g. "#fff", "var(--custom)") pass through unchanged.
export const BACKGROUND: Record<string, string> = {
  'primary/surface': 'var(--lui-color-primary-background-surface)',
  'primary/container': 'var(--lui-color-primary-background-container)',
  'secondary/surface': 'var(--lui-color-secondary-background-surface)',
  'secondary/container': 'var(--lui-color-secondary-background-container)',
  'neutral/surface': 'var(--lui-color-neutral-background-surface)',
  'neutral/container': 'var(--lui-color-neutral-background-container)',
  'neutral/overlay': 'var(--lui-color-neutral-background-overlay)',
  'caution/surface': 'var(--lui-color-caution-background-surface)',
  'caution/container': 'var(--lui-color-caution-background-container)',
  'info/surface': 'var(--lui-color-info-background-surface)',
  'info/container': 'var(--lui-color-info-background-container)',
  'danger/surface': 'var(--lui-color-danger-background-surface)',
  'danger/container': 'var(--lui-color-danger-background-container)',
  'success/surface': 'var(--lui-color-success-background-surface)',
  'success/container': 'var(--lui-color-success-background-container)',
};

export function resolveBackground(
  value: string | undefined | null
): string | null {
  if (!value) return null;
  return BACKGROUND[value] ?? value;
}

// Semantic border-color aliases: {category}/{variant} → CSS custom property.
// Raw CSS values pass through unchanged.
export const BORDER_COLOR: Record<string, string> = {
  'neutral/subtle': 'var(--lui-color-neutral-border-subtle)',
  'neutral/default': 'var(--lui-color-neutral-border-default)',
  'primary/default': 'var(--lui-color-primary-border-default)',
  'secondary/default': 'var(--lui-color-secondary-border-default)',
  'caution/default': 'var(--lui-color-caution-border-default)',
  'info/default': 'var(--lui-color-info-border-default)',
  'danger/default': 'var(--lui-color-danger-border-default)',
  'success/default': 'var(--lui-color-success-border-default)',
};

export function resolveBorderColor(
  value: string | undefined | null
): string | null {
  if (!value) return null;
  return BORDER_COLOR[value] ?? value;
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
