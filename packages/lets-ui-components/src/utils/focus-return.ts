import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { FOCUSABLE } from './dialog-trigger.js';

// The element that holds focus, followed down through open shadow roots: for
// a Let's UI button that is the native button inside it, not its host.
export function deepActiveElement(): HTMLElement | null {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el instanceof HTMLElement && el !== document.body ? el : null;
}

// Whether `node` is `host` or inside it, crossing shadow boundaries upward:
// `contains()` alone stops at the first shadow root.
function composedContains(host: Node, node: Node | null): boolean {
  while (node) {
    if (node === host) return true;
    node = node.parentNode ?? (node as ShadowRoot).host ?? null;
  }
  return false;
}

function holdsFocus(el: HTMLElement): boolean {
  return composedContains(el, deepActiveElement());
}

type DialogHost = ReactiveControllerHost & HTMLElement & { open: boolean };

/**
 * Sends focus back to the element that opened a dialog once it closes.
 *
 * The opener is recorded before the render that opens the dialog, while focus
 * is still on it. On close (any path that sets `open` to false, or removing
 * the open host from the page) focus goes back to it; when it is gone or
 * cannot take focus, to `fallback()`, the dialog's own trigger. Focus that
 * has already left the host, moved there by a listener, is left alone.
 */
export class FocusReturnController implements ReactiveController {
  private _opener: HTMLElement | null = null;
  private _wasOpen = false;

  constructor(
    private host: DialogHost,
    private fallback: () => HTMLElement | null
  ) {
    host.addController(this);
  }

  hostUpdate() {
    if (this.host.open && !this._wasOpen) {
      this._opener = deepActiveElement();
    }
  }

  hostUpdated() {
    if (!this.host.open && this._wasOpen) this._return();
    this._wasOpen = this.host.open;
  }

  hostDisconnected() {
    // Unmounted while open: focus went down with the host, so it lands on
    // the body unless sent back.
    if (this._wasOpen) this._return();
    this._wasOpen = false;
  }

  private _return() {
    const opener = this._opener;
    this._opener = null;
    const active = deepActiveElement();
    if (active && !composedContains(this.host, active)) return;

    for (const el of [opener, this.fallback()]) {
      if (!el?.isConnected) continue;
      // A custom element without `delegatesFocus` ignores `focus()` on its
      // host, so the control inside its shadow root takes it.
      const control =
        el.shadowRoot?.querySelector<HTMLElement>(FOCUSABLE) ?? el;
      control.focus();
      if (holdsFocus(el)) return;
    }
    // Nothing could take it: do not leave focus on a panel being hidden.
    active?.blur();
  }
}
