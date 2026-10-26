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

// The trigger's accessible name as its author wrote it: `aria-label` first,
// then the `label` Let's UI buttons render as text, then the text itself.
const triggerName = (el: HTMLElement) =>
  (
    el.getAttribute('aria-label') ||
    el.getAttribute('label') ||
    el.textContent ||
    ''
  )
    .trim()
    .toLowerCase();

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
      this._describe(
        this._describedTrigger,
        this._descriptionFor(this._describedTrigger)
      );
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

  // On an icon-only button the tooltip usually spells out the button's own
  // name. Describing it with the same text would make a screen reader say it
  // twice, so a tooltip that repeats the name leaves the description to the
  // author's own.
  private _descriptionFor(el: HTMLElement) {
    return triggerName(el) === this.text.trim().toLowerCase()
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
    }
    // Every pass, not only when the trigger changes: its name may have changed
    // into or out of matching the text.
    if (trigger) this._describe(trigger, this._descriptionFor(trigger));
    this._wrapperFocusable = this._hasCustomTrigger && !trigger;
  }

  render() {
    const position = this._position;
    const describedBy = `${this._baseId}-content`;
    const computedAriaLabel =
      this.ariaLabel ||
      (this._hasCustomTrigger ? '' : `${this.label}: ${this.text}`);

    // With a described trigger the text reaches it as a property, and the
    // content is only what sighted users see: left in the tree, browse mode
    // would read it a second time right after the trigger.
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
        <span
          id="${describedBy}"
          class="tooltip__content"
          role="tooltip"
          aria-hidden="${ifDefined(
            this._hasCustomTrigger && !this._wrapperFocusable
              ? 'true'
              : undefined
          )}"
          >${this.text}</span
        >
      </span>
    `;
  }
}
