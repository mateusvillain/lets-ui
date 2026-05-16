type Size = 'xl' | 'lg' | 'md' | 'sm';

interface LuiElement extends HTMLElement {
  __luiId?: string;
}

let elementIdCounter = 0;

export function hasBooleanAttribute(
  element: HTMLElement,
  name: string
): boolean {
  if (!element.hasAttribute(name)) return false;
  return element.getAttribute(name) !== 'false';
}

const SIZES = ['xl', 'lg', 'md', 'sm'] as const;

export function readSize(element: HTMLElement, fallback: Size = 'md'): Size {
  const size = element.getAttribute('size') ?? fallback;
  return SIZES.includes(size as Size) ? (size as Size) : fallback;
}

export function ensureElementId(element: LuiElement, prefix: string): string {
  if (!element.__luiId) {
    elementIdCounter += 1;
    element.__luiId = `${prefix}-${elementIdCounter}`;
  }
  return element.__luiId;
}

export function lockBodyScroll(): void {
  const count = parseInt(document.body.dataset['luiLockCount'] ?? '0', 10);
  document.body.dataset['luiLockCount'] = String(count + 1);
  document.body.style.overflow = 'hidden';
}

export function unlockBodyScroll(): void {
  const count = Math.max(
    0,
    parseInt(document.body.dataset['luiLockCount'] ?? '0', 10) - 1
  );
  document.body.dataset['luiLockCount'] = String(count);
  if (count === 0) document.body.style.overflow = '';
}
