/**
 * Whether `event` is a click on an element carrying `attribute` (or on
 * something inside one) that belongs to `host`.
 *
 * Walks the composed path from the target up to the host, so the attribute
 * may sit on a Let's UI host such as `lui-button` while the click comes from
 * the button in its shadow root. Any other `DialogType` on the way is a
 * nested dialog: the click is its business, whether the closer sits inside it
 * or wraps it. The host's own attribute does not count, or every click in the
 * dialog would close it.
 *
 * A click that was cancelled, or that went through an `aria-disabled` control
 * (a `lui-button` that is loading), does not close.
 */
export function isDialogCloseClick(
  event: Event,
  host: HTMLElement,
  attribute: string,
  DialogType: typeof HTMLElement
): boolean {
  if (event.defaultPrevented) return false;

  let closer = false;
  for (const node of event.composedPath()) {
    if (node === host) return closer;
    if (!(node instanceof Element)) continue;
    if (node instanceof DialogType) return false;
    if (!closer && node.getAttribute('aria-disabled') === 'true') return false;
    if (node.hasAttribute(attribute)) closer = true;
  }
  return false;
}
