// The element that holds focus, followed down through open shadow roots: for
// a Let's UI button that is the native button inside it, not its host.
export function deepActiveElement(): HTMLElement | null {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el instanceof HTMLElement && el !== document.body ? el : null;
}

// Whether focus is on `host`, in its shadow root or in its slotted content.
// Shadow-root focus retargets document.activeElement to the host.
function focusIsWithin(host: HTMLElement): boolean {
  const active = document.activeElement;
  return !active || active === document.body || host.contains(active);
}

function holdsFocus(el: HTMLElement): boolean {
  const active = deepActiveElement();
  return !!active && (active === el || !!el.shadowRoot?.contains(active));
}

/**
 * Sends focus back to the element that opened a dialog once it closes.
 *
 * Leaves focus alone when it has already moved outside `host` (a listener
 * that sent it elsewhere wins). When `target` is gone or cannot take focus,
 * tries `fallback` (the dialog's own trigger). A custom element without
 * `delegatesFocus` ignores `focus()` on its host, so the control inside its
 * shadow root is focused instead.
 */
export function returnFocus(
  host: HTMLElement,
  target: HTMLElement | null,
  fallback: HTMLElement | null | undefined
): void {
  if (!focusIsWithin(host)) return;
  for (const el of [target, fallback]) {
    if (!el?.isConnected) continue;
    const control =
      el.shadowRoot?.querySelector<HTMLElement>('button, [href]') ?? el;
    control.focus();
    if (holdsFocus(el)) return;
  }
}
