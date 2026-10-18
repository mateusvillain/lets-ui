// Interactive descendants only: a [tabindex="-1"] icon or a disabled control
// ahead of the real button must not take the trigger's ARIA.
export const FOCUSABLE =
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
 * Set through the ARIA properties, not attributes: a native trigger reflects
 * them as usual, and a Let's UI one renders them on its inner control without
 * leaving them on its role-less host.
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
    el.ariaHasPopup = null;
    el.ariaExpanded = null;
  }
  for (const el of targets) {
    el.ariaHasPopup = 'dialog';
    el.ariaExpanded = open ? 'true' : 'false';
  }
  return targets;
}
