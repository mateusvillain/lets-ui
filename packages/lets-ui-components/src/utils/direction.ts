import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Writing direction, for the few things CSS logical properties can't reach:
 * which arrow key means "next", which physical side `start` lands on when a
 * component computes a position in script.
 *
 * Styles should not need this — `inset-inline-start`, `margin-inline-end` and
 * `:dir(rtl)` already follow the page. Reach for it only where the decision is
 * made in TypeScript.
 */

/** Whether the element lays out right to left: `dir="rtl"` on it or an ancestor. */
export function isRtl(element: Element): boolean {
  return getComputedStyle(element).direction === 'rtl';
}

/**
 * The key as a left-to-right layout would read it: `ArrowLeft` and
 * `ArrowRight` swap when the element is right to left, every other key passes
 * through. Keyboard handlers written for left to right — `ArrowRight` is
 * "next" — then work in both directions:
 *
 * ```ts
 * switch (ltrKey(e.key, this)) {
 *   case 'ArrowRight': // the next tab, wherever it sits on screen
 * ```
 */
export function ltrKey(key: string, element: Element): string {
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return key;
  if (!isRtl(element)) return key;
  return key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
}

/** `start` and `end` resolved to the physical side they fall on. */
export function physicalSide(
  element: Element,
  side: 'start' | 'end'
): 'left' | 'right' {
  return (side === 'start') !== isRtl(element) ? 'left' : 'right';
}

// Hosts whose render reads the direction, so a `dir` change re-renders them.
const hosts = new Set<ReactiveControllerHost>();
let observer: MutationObserver | undefined;

function observeDir() {
  if (observer || typeof MutationObserver === 'undefined') return;
  // A `dir` can change on any ancestor; the filter keeps the callback to that
  // one attribute.
  observer = new MutationObserver(() => {
    for (const host of hosts) host.requestUpdate();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dir'],
    subtree: true,
  });
}

/**
 * Re-renders the host when a `dir` changes anywhere in the document. For
 * components whose template, not only their keyboard handling, depends on the
 * direction.
 */
export class DirectionController implements ReactiveController {
  constructor(private host: ReactiveControllerHost) {
    host.addController(this);
  }

  hostConnected() {
    hosts.add(this.host);
    observeDir();
  }

  hostDisconnected() {
    hosts.delete(this.host);
  }
}
