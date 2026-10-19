import type { ReactiveController, ReactiveControllerHost } from 'lit';

type DialogHost = ReactiveControllerHost & HTMLElement & { open: boolean };

interface DialogKeys {
  /** Escape reached the dialog: close it. */
  escape: () => void;
  /** Tab or Shift+Tab: keep focus inside the dialog. */
  tab: (event: KeyboardEvent) => void;
}

// Open dialogs in the order they opened: the last one is on top.
const stack: DialogStackController[] = [];

// On the window, so it runs after every listener on the document and on the
// path to it: a component inside the dialog that uses Escape (an open menu,
// a tooltip) calls preventDefault() first, and the dialog then leaves it.
function handleKeydown(event: KeyboardEvent) {
  const top = stack[stack.length - 1];
  if (!top) return;
  if (event.key === 'Escape') {
    if (event.defaultPrevented) return;
    event.preventDefault();
    top.keys.escape();
  } else if (event.key === 'Tab') {
    top.keys.tab(event);
  }
}

/**
 * Gives keyboard handling to the topmost open dialog only.
 *
 * Every open Modal and Drawer joins one shared stack; a single listener sends
 * Escape and Tab to the dialog on top. Stacked dialogs (a Modal opened from a
 * Drawer) then close one Escape at a time, and only the top one traps focus.
 */
export class DialogStackController implements ReactiveController {
  constructor(
    private host: DialogHost,
    readonly keys: DialogKeys
  ) {
    host.addController(this);
  }

  hostConnected() {
    if (this.host.open) this._push();
  }

  hostUpdated() {
    if (this.host.open) this._push();
    else this._remove();
  }

  hostDisconnected() {
    this._remove();
  }

  private _push() {
    if (stack.includes(this)) return;
    if (!stack.length) window.addEventListener('keydown', handleKeydown);
    stack.push(this);
  }

  private _remove() {
    const index = stack.indexOf(this);
    if (index === -1) return;
    stack.splice(index, 1);
    if (!stack.length) window.removeEventListener('keydown', handleKeydown);
  }
}
