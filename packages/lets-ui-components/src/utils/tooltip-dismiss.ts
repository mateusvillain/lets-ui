import type { ReactiveController, ReactiveControllerHost } from 'lit';

// A tooltip that covers other content has to go away on Escape without the
// reader moving the pointer or the focus (WCAG 1.4.13). The listener sits on
// the document because a hovering pointer leaves the focus wherever it was.
// One listener serves every tooltip on the page.
const controllers = new Set<TooltipDismissController>();

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  let dismissed = false;
  controllers.forEach((controller) => {
    if (controller.dismiss()) dismissed = true;
  });
  // Consumed when it put a tooltip away: a dialog holding the tooltip stays
  // open until the next Escape.
  if (dismissed) event.preventDefault();
};

/**
 * Puts a shown tooltip away on Escape and lets it show again on the next
 * hover or focus. The host renders `tooltip--dismissed` on the `.tooltip`
 * wrapper while `dismissed` is true, and calls `restore` on the wrapper's
 * `pointerenter` and `focusin`.
 */
export class TooltipDismissController implements ReactiveController {
  dismissed = false;

  constructor(
    private host: ReactiveControllerHost,
    private wrapper: () => Element | null | undefined
  ) {
    host.addController(this);
  }

  hostConnected() {
    if (!controllers.size) document.addEventListener('keydown', handleEscape);
    controllers.add(this);
  }

  hostDisconnected() {
    controllers.delete(this);
    if (!controllers.size) {
      document.removeEventListener('keydown', handleEscape);
    }
  }

  // Whether a shown tooltip was put away.
  dismiss(): boolean {
    if (this.dismissed || !this.wrapper()?.matches(':hover, :focus-within')) {
      return false;
    }
    this.dismissed = true;
    this.host.requestUpdate();
    return true;
  }

  restore = () => {
    if (!this.dismissed) return;
    this.dismissed = false;
    this.host.requestUpdate();
  };
}
