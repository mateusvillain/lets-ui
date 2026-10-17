import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './tooltip.scss?inline';

const VALID_POSITIONS = new Set(['top', 'bottom', 'left', 'right']);
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), lui-button, lui-icon-button, lui-link';

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

  // A slotted trigger with nothing focusable in it, such as plain text: the
  // wrapper becomes the Tab stop, so keyboard users can still reach the text.
  @state() private _wrapperFocusable = false;

  private _describedTrigger: HTMLElement | null = null;

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('text') && this._describedTrigger) {
      this._describedTrigger.ariaDescription = this.text;
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
  // property rather than an attribute: `lui-button`, `lui-icon-button` and
  // `lui-link` pass it on to their inner control without leaving it on their
  // role-less host, and on a native element it reflects to the attribute.
  private _handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasCustomTrigger = slot.assignedNodes({ flatten: true }).length > 0;

    const trigger = this._findTrigger(slot);
    if (this._describedTrigger !== trigger) {
      if (this._describedTrigger) this._describedTrigger.ariaDescription = null;
      this._describedTrigger = trigger;
    }
    if (trigger) trigger.ariaDescription = this.text;
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
              ><slot @slotchange="${this._handleSlotChange}"></slot
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
                @slotchange="${this._handleSlotChange}"
              ></slot>
            `}
        <span id="${describedBy}" class="tooltip__content" role="tooltip"
          >${this.text}</span
        >
      </span>
    `;
  }
}
