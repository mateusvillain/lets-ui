import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './tooltip.scss?inline';

const VALID_POSITIONS = new Set(['top', 'bottom', 'left', 'right']);
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), lui-button, lui-icon-button, lui-link';

export class LuiTooltip extends LitElement {
  static styles = unsafeCSS(styles);

  @property() text = 'Tooltip';
  @property() position = 'top';
  @property() label = 'Mostrar tooltip';
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

  private _handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    this._hasCustomTrigger = nodes.length > 0;

    // Connect aria-describedby to focusable elements inside the trigger slot
    if (this._hasCustomTrigger) {
      const triggerWrapper = this.shadowRoot?.querySelector(
        '[data-tooltip-trigger]'
      );
      if (triggerWrapper) {
        const focusables = Array.from(
          triggerWrapper.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        const describedBy = `${this._baseId}-content`;
        if (focusables.length > 0) {
          focusables.forEach((el) =>
            el.setAttribute('aria-describedby', describedBy)
          );
        } else {
          (triggerWrapper as HTMLElement).setAttribute('tabindex', '0');
          (triggerWrapper as HTMLElement).setAttribute(
            'aria-describedby',
            describedBy
          );
        }
      }
    }
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
          ? html`<span class="tooltip__trigger" data-tooltip-trigger
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
