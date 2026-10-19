/**
 * Whether `event` is a click on an element carrying `attribute` (or on
 * something inside one) that belongs to `host`.
 *
 * Walks the composed path, so the attribute may sit on a Let's UI host such
 * as `lui-button` while the click comes from the button in its shadow root.
 * The closer belongs to the nearest dialog of the host's own type above it: a
 * closer inside a nested `lui-modal` closes that one, not its parent.
 */
export function isDialogCloseClick(
  event: Event,
  host: HTMLElement,
  attribute: string
): boolean {
  const path = event.composedPath();
  const closer = path.findIndex(
    (node) => node instanceof Element && node.hasAttribute(attribute)
  );
  if (closer === -1) return false;

  const DialogType = host.constructor as typeof HTMLElement;
  const owner = path.slice(closer).find((node) => node instanceof DialogType);
  return owner === host;
}
