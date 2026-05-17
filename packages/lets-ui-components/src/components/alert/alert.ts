import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './alert.scss?inline';

const VARIANT_ICONS: Record<string, TemplateResult> = {
  success: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="alert__icon"
    aria-hidden="true"
  >
    <path
      d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3ZM12 4.5C7.85786 4.5 4.5 7.85786 4.5 12C4.5 16.1421 7.85786 19.5 12 19.5C16.1421 19.5 19.5 16.1421 19.5 12C19.5 7.85786 16.1421 4.5 12 4.5ZM15.9697 8.46973C16.2626 8.17684 16.7374 8.17684 17.0303 8.46973C17.3232 8.76262 17.3232 9.23738 17.0303 9.53027L11.0303 15.5303C10.7374 15.8232 10.2626 15.8232 9.96973 15.5303L6.96973 12.5303C6.67683 12.2374 6.67683 11.7626 6.96973 11.4697C7.26262 11.1768 7.73738 11.1768 8.03027 11.4697L10.5 13.9395L15.9697 8.46973Z"
    />
  </svg>`,
  caution: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="alert__icon"
    aria-hidden="true"
  >
    <path
      d="M12 3.75C12.2724 3.75 12.5232 3.89789 12.6555 4.13599L20.1555 17.636C20.2844 17.8682 20.2813 18.1512 20.1467 18.3801C20.012 18.6092 19.7657 18.75 19.5 18.75H4.49998C4.23425 18.75 3.98802 18.6092 3.85325 18.3801C3.71869 18.1512 3.71554 17.8682 3.84447 17.636L11.3445 4.13599L11.3994 4.05103C11.5398 3.8632 11.7616 3.75 12 3.75ZM5.7744 17.25H18.2256L12 6.04395L5.7744 17.25ZM12 15C12.4142 15 12.75 15.3358 12.75 15.75C12.75 16.1642 12.4142 16.5 12 16.5C11.5858 16.5 11.25 16.1642 11.25 15.75C11.25 15.3358 11.5858 15 12 15ZM12 9C12.4142 9.00001 12.75 9.33579 12.75 9.75V13.5C12.75 13.9142 12.4142 14.25 12 14.25C11.5858 14.25 11.25 13.9142 11.25 13.5V9.75C11.25 9.33579 11.5858 9 12 9Z"
    />
  </svg>`,
  danger: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="alert__icon"
    aria-hidden="true"
  >
    <path
      d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3ZM12 4.5C7.85786 4.5 4.5 7.85786 4.5 12C4.5 16.1421 7.85786 19.5 12 19.5C16.1421 19.5 19.5 16.1421 19.5 12C19.5 7.85786 16.1421 4.5 12 4.5ZM12 15C12.4142 15 12.75 15.3358 12.75 15.75C12.75 16.1642 12.4142 16.5 12 16.5C11.5858 16.5 11.25 16.1642 11.25 15.75C11.25 15.3358 11.5858 15 12 15ZM12 7.5C12.4142 7.5 12.75 7.83579 12.75 8.25V12.75C12.75 13.1642 12.4142 13.5 12 13.5C11.5858 13.5 11.25 13.1642 11.25 12.75V8.25C11.25 7.83579 11.5858 7.5 12 7.5Z"
    />
  </svg>`,
  info: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="alert__icon"
    aria-hidden="true"
  >
    <path
      d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3ZM12 4.5C7.85786 4.5 4.5 7.85786 4.5 12C4.5 16.1421 7.85786 19.5 12 19.5C16.1421 19.5 19.5 16.1421 19.5 12C19.5 7.85786 16.1421 4.5 12 4.5ZM12.75 15H13.5C13.9142 15 14.25 15.3358 14.25 15.75C14.25 16.1642 13.9142 16.5 13.5 16.5H10.5C10.0858 16.5 9.75 16.1642 9.75 15.75C9.75 15.3358 10.0858 15 10.5 15H11.25V12H10.5C10.0858 12 9.75 11.6642 9.75 11.25C9.75 10.8358 10.0858 10.5 10.5 10.5H12.75V15ZM11.8125 7.5C12.3303 7.5 12.75 7.91973 12.75 8.4375C12.75 8.95527 12.3303 9.375 11.8125 9.375C11.2947 9.375 10.875 8.95527 10.875 8.4375C10.875 7.91973 11.2947 7.5 11.8125 7.5Z"
    />
  </svg>`,
};

export class LuiAlert extends LitElement {
  static styles = unsafeCSS(styles);

  @property() variant = 'success';
  @property() title = '';
  @property() content = '';

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
