import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './tooltip.scss?inline';
import { HostAriaMixin } from '../../utils/aria.js';

const VALID_POSITIONS = new Set(['top', 'bottom', 'left', 'right']);
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), lui-button, lui-close-button, lui-icon-button, lui-link';

// Native controls match `:disabled`. Let's UI buttons take `disabled` as a
// property that not all of them reflect, and may not be upgraded yet, so both
// are checked. A disabled `lui-link` stays focusable, so it is not disabled
// here.
const isDisabled = (el: HTMLElement) =>
  el.matches(':disabled') ||
  (el.localName.startsWith('lui-') &&
    el.localName !== 'lui-link' &&
    (el.hasAttribute('disabled') ||
      (el as HTMLElement & { disabled?: boolean }).disabled === true));

// Formatting whitespace around the content is not a trigger.
const isContent = (node: Node) =>
  node.nodeType === Node.ELEMENT_NODE || !!node.textContent?.trim();

const normalize = (value: string) =>
  value.replace(/\s+/g, ' ').trim().toLowerCase();

// Attributes that change a trigger's name, on it or inside it.
const NAME_ATTRIBUTES = [
  'aria-label',
  'aria-labelledby',
  'aria-hidden',
  'hidden',
];

// The text a node contributes to a name: slots stand for what they render,
// hidden content contributes nothing.
const textOf = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof Element)) return '';
  if (
    node.getAttribute('aria-hidden') === 'true' ||
    node.hasAttribute('hidden') ||
    node.matches('style, script, template')
  ) {
    return '';
  }
  const children =
    node instanceof HTMLSlotElement
      ? node.assignedNodes({ flatten: true })
      : [...node.childNodes];
  return children.map(textOf).join('');
};

// The trigger's name, as far as the tooltip needs it. A Let's UI trigger is
// read from the control it renders, which holds what its host only passes
// on: `label`, `loading-text`, a link's external label.
const nameOf = (el: HTMLElement) => {
  const control = el.shadowRoot?.querySelector('button, a') ?? el;
  const labelledBy = control.getAttribute('aria-labelledby')?.trim();
  if (labelledBy) {
    const root = control.getRootNode() as Document | ShadowRoot;
    return labelledBy
      .split(/\s+/)
      .map((id) => {
        const label = root.getElementById(id);
        return label ? textOf(label) : '';
      })
      .join(' ');
  }
  return control.getAttribute('aria-label') || textOf(control);
};

export class LuiTooltip extends HostAriaMixin(LitElement) {
  static styles = unsafeCSS(styles);

  @property() text = 'Tooltip';
  @property() position = 'top';
  @property() label = 'Show tooltip';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  @state() private _hasCustomTrigger = false;

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-tooltip-${Math.random().toString(36).slice(2, 9)}`;
  }

  get _position(): 'top' | 'bottom' | 'left' | 'right' {
    return VALID_POSITIONS.has(this.position)
      ? (this.position as 'top' | 'bottom' | 'left' | 'right')
      : 'top';
  }

  // A slotted trigger with nothing focusable in it, such as plain text or a
  // disabled button: the wrapper becomes the Tab stop, so keyboard users can
  // still reach the text.
  @state() private _wrapperFocusable = false;

  private _describedTrigger: HTMLElement | null = null;
  // Each trigger's own description, put back when it leaves the slot.
  private _authorDescriptions = new WeakMap<HTMLElement, string | null>();

  // `slotchange` only fires for the slot's direct children: a button rendered
  // inside a slotted wrapper later, or a trigger that gets disabled, would go
  // unnoticed.
  private _observer = new MutationObserver(() => this._syncTrigger());
  // A Let's UI trigger renders its name in its own shadow root, out of reach
  // of the observer above: a `label` set as a property changes nothing there.
  private _nameObserver = new MutationObserver(() => {
    if (this._describedTrigger) this._describe(this._describedTrigger);
  });

  connectedCallback() {
    super.connectedCallback();
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['disabled', 'href', 'tabindex', ...NAME_ATTRIBUTES],
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer.disconnect();
    this._nameObserver.disconnect();
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('text') && this._describedTrigger) {
      this._describe(this._describedTrigger);
    }
  }

  // The trigger is slotted, so it lives in the light DOM: a query from the
  // wrapper inside this shadow root never reaches it. The slot's assigned
  // elements do.
  private _findTrigger(slot: HTMLSlotElement): HTMLElement | null {
    for (const el of slot.assignedElements({ flatten: true })) {
      const focusable = el.matches(FOCUSABLE_SELECTOR)
        ? el
        : el.querySelector(FOCUSABLE_SELECTOR);
      if (focusable) return focusable as HTMLElement;
    }
    return null;
  }

  // The content's ID lives in this shadow root, and an IDREF cannot cross it,
  // so the trigger gets the text itself as its `ariaDescription`. Set as a
  // property rather than an attribute: `lui-button`, `lui-close-button`,
  // `lui-icon-button` and `lui-link` pass it on to their inner control without
  // leaving it on their role-less host, and on a native element it reflects to
  // the attribute. Before a Let's UI element is upgraded only the native,
  // reflecting setter exists, so it waits for the element's own, and for its
  // first render, which holds its name.
  //
  // A tooltip that repeats the trigger's name, the usual case for an Icon
  // Button, would have screen readers announce it twice: the trigger keeps the
  // author's description instead. The value is decided from the state once
  // the wait is over, so calls that resolve out of order agree.
  private async _describe(el: HTMLElement) {
    if (!el.matches(':defined')) await customElements.whenDefined(el.localName);
    await (el as HTMLElement & { updateComplete?: Promise<unknown> })
      .updateComplete;

    const author = this._authorDescriptions.get(el) ?? null;
    let value: string | null;
    if (el === this._describedTrigger) {
      value =
        normalize(this.text) === normalize(nameOf(el)) ? author : this.text;
      if (el.shadowRoot) {
        this._nameObserver.observe(el.shadowRoot, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: NAME_ATTRIBUTES,
        });
      }
    } else {
      // Already put back by an earlier call.
      if (!this._authorDescriptions.has(el)) return;
      this._authorDescriptions.delete(el);
      value = author;
    }
    if (el.ariaDescription !== value) el.ariaDescription = value;
  }

  private _syncTrigger() {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return;
    this._hasCustomTrigger = slot
      .assignedNodes({ flatten: true })
      .some(isContent);

    const control = this._hasCustomTrigger ? this._findTrigger(slot) : null;
    const trigger = control && !isDisabled(control) ? control : null;
    const previous = this._describedTrigger;
    if (previous !== trigger) {
      this._nameObserver.disconnect();
      this._describedTrigger = trigger;
      if (previous) this._describe(previous);
      // A trigger back before its description was put back keeps the one
      // already recorded, not the tooltip's text.
      if (trigger && !this._authorDescriptions.has(trigger)) {
        this._authorDescriptions.set(trigger, trigger.ariaDescription ?? null);
      }
    }
    // Also run for the same trigger: its name may have changed to match the
    // text, or to stop matching it.
    if (trigger) this._describe(trigger);
    this._wrapperFocusable = this._hasCustomTrigger && !trigger;
  }

  render() {
    const position = this._position;
    const describedBy = `${this._baseId}-content`;
    const computedAriaLabel =
      this.ariaLabel ||
      (this._hasCustomTrigger ? '' : `${this.label}: ${this.text}`);

    return html`
      <span class="tooltip tooltip--${position}">
        ${this._hasCustomTrigger
          ? html`<span
              class="tooltip__trigger"
              data-tooltip-trigger
              tabindex="${ifDefined(this._wrapperFocusable ? '0' : undefined)}"
              aria-describedby="${ifDefined(
                this._wrapperFocusable ? describedBy : undefined
              )}"
              ><slot @slotchange="${this._syncTrigger}"></slot
            ></span>`
          : html`
              <button
                type="button"
                class="tooltip__trigger"
                data-tooltip-trigger
                aria-label="${computedAriaLabel}"
                aria-describedby="${describedBy}"
              >
                ${this.label}
              </button>
              <slot
                style="display:none"
                @slotchange="${this._syncTrigger}"
              ></slot>
            `}
        <span id="${describedBy}" class="tooltip__content" role="tooltip"
          >${this.text}</span
        >
      </span>
    `;
  }
}
