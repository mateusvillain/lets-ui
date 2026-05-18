/** Returns the computed value of a Let's UI CSS custom property. */
export function getToken(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
