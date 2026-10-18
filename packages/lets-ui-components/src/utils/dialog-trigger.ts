// Interactive descendants only: a [tabindex="-1"] icon or a disabled control
// ahead of the real button must not take the trigger's ARIA.
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function triggerTarget(el: Element): HTMLElement {
  if (el.matches(FOCUSABLE)) return el as HTMLElement;
  return (el.querySelector<HTMLElement>(FOCUSABLE) ?? el) as HTMLElement;
}

/**
 * Applies the dialog-trigger contract to the elements assigned to `slot` and
 * strips it from any element that has left the slot since the last call.
 *
 * No aria-controls: the dialog lives in the host's shadow root, and neither an
 * IDREF nor ariaControlsElements can point into it from the light DOM.
 * aria-haspopup + aria-expanded carry the contract on their own.
 *
 * Returns the current targets; pass them back as `previous` on the next call.
 */
export function syncDialogTriggers(
  slot: HTMLSlotElement | null | undefined,
  open: boolean,
  previous: ReadonlySet<HTMLElement>
): Set<HTMLElement> {
  const targets = new Set(
    (slot?.assignedElements({ flatten: true }) ?? []).map(triggerTarget)
  );
  for (const el of previous) {
    if (targets.has(el)) continue;
    el.removeAttribute('aria-haspopup');
    el.removeAttribute('aria-expanded');
  }
  for (const el of targets) {
    el.setAttribute('aria-haspopup', 'dialog');
    el.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  return targets;
}
