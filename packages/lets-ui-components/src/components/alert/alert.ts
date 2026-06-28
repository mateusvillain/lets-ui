import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './alert.scss?inline';

const VARIANT_ICONS: Record<string, TemplateResult> = {
  success: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
    class="alert__icon"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-10.5 4.06 6.53-6.53-1.06-1.06-5.47 5.47-2.47-2.47-1.06 1.06 3.53 3.53Z"
      clip-rule="evenodd"
    />
  </svg>`,
  caution: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
    class="alert__icon"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="m20.143 17.25.857 1.5H3l.857-1.5 7.28-12.738L12 3l.864 1.512 7.279 12.738ZM11.25 9h1.5v5.25h-1.5V9Zm0 6.75a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Z"
      clip-rule="evenodd"
    />
  </svg>`,
  danger: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
    class="alert__icon"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-.75-5.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Zm1.5-8.25h-1.5v6h1.5v-6Z"
      clip-rule="evenodd"
    />
  </svg>`,
  info: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
    class="alert__icon"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-8.25 3v-4.5h-3V12h1.5v3h-1.5v1.5h4.5V15h-1.5Zm-1.875-6.563a.937.937 0 1 1 1.875 0 .937.937 0 0 1-1.875 0Z"
      clip-rule="evenodd"
    />
  </svg>`,
};

export class LuiAlert extends LitElement {
  static styles = unsafeCSS(styles);

  @property() variant = 'success';
  @property() title = '';
  @property() content = '';
  @property({ type: Boolean }) dismissible = false;
  @property({ attribute: 'close-label' }) closeLabel = 'Close';

  @state() private _actionsSlotted = false;

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-alert-${Math.random().toString(36).slice(2, 9)}`;
  }

  private _handleActionsSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._actionsSlotted = slot.assignedNodes({ flatten: true }).length > 0;
  }

  private _handleDismiss() {
    this.dispatchEvent(
      new CustomEvent('lui-dismiss', { bubbles: true, composed: true })
    );
  }

  render() {
    const variant = VARIANT_ICONS[this.variant] ? this.variant : 'success';

    return html`
      <div
        class="alert alert--${variant}"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        aria-labelledby="${this._baseId}-title"
        aria-describedby="${this._baseId}-content"
      >
        <div class="alert__content">
          ${VARIANT_ICONS[variant]}
          <div class="alert__text">
            <p id="${this._baseId}-title" class="body--lg">${this.title}</p>
            <p id="${this._baseId}-content" class="body--lg">${this.content}</p>
          </div>
          ${this.dismissible
            ? html`<lui-close-button
                size="sm"
                label="${this.closeLabel}"
                @click="${this._handleDismiss}"
              ></lui-close-button>`
            : ''}
        </div>
        <div
          class="alert__actions"
          style="${this._actionsSlotted ? '' : 'display:none'}"
        >
          <slot
            name="actions"
            @slotchange="${this._handleActionsSlotChange}"
          ></slot>
        </div>
      </div>
    `;
  }
}
