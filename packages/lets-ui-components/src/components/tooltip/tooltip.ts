import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './tooltip.scss?inline';

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

// The trigger's name, as far as the tooltip can tell: its `aria-label`, else
// its text, else the `label` a Let's UI button renders when it has no content.
const nameOf = (el: HTMLElement) =>
  el.getAttribute('aria-label') ||
  el.textContent?.trim() ||
  (el as HTMLElement & { label?: string }).label ||
  '';

export class LuiTooltip extends LitElement {
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
  // The trigger's own description, put back when it leaves the slot.
  private _authorDescription: string | null = null;

  // `slotchange` only fires for the slot's direct children: a button rendered
  // inside a slotted wrapper later, or a trigger that gets disabled, would go
  // unnoticed.
  private _observer = new MutationObserver(() => this._syncTrigger());

  connectedCallback() {
    super.connectedCallback();
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['disabled', 'href', 'tabindex', 'aria-label', 'label'],
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer.disconnect();
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('text') && this._describedTrigger) {
      this._describeWithText(this._describedTrigger);
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
  // reflecting setter exists, so it waits for the element's own.
  private async _describe(el: HTMLElement, value: string | null) {
    if (!el.matches(':defined')) await customElements.whenDefined(el.localName);
    el.ariaDescription = value;
  }

  // A tooltip that repeats the trigger's name, the usual case for an Icon
  // Button, would have screen readers announce it twice: the trigger keeps
  // the author's description instead. The name is read once the trigger is
  // upgraded, since a Let's UI button only knows its `label` by then.
  private async _describeWithText(el: HTMLElement) {
    if (!el.matches(':defined')) await customElements.whenDefined(el.localName);
    if (this._describedTrigger !== el) return;
    el.ariaDescription =
      normalize(this.text) === normalize(nameOf(el))
        ? this._authorDescription
        : this.text;
  }

  private _syncTrigger() {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return;
    this._hasCustomTrigger = slot
      .assignedNodes({ flatten: true })
      .some(isContent);

    const control = this._hasCustomTrigger ? this._findTrigger(slot) : null;
    const trigger = control && !isDisabled(control) ? control : null;
    if (this._describedTrigger !== trigger) {
      if (this._describedTrigger) {
        this._describe(this._describedTrigger, this._authorDescription);
      }
      this._describedTrigger = trigger;
      this._authorDescription = trigger?.ariaDescription ?? null;
      if (trigger) this._describeWithText(trigger);
    } else if (trigger) {
      // Its name may have changed to match the text, or to stop matching it.
      this._describeWithText(trigger);
    }
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
