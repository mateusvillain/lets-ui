import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './alert.scss?inline';
import iconStyles from 'lets-ui-icons/dist/lets-ui-icons.css?inline';

const VARIANT_ICONS: Record<string, string> = {
  success: 'check-circle',
  caution: 'alert',
  danger: 'exclamation-circle',
  info: 'info-circle',
};

export class LuiAlert extends LitElement {
  static styles = [unsafeCSS(styles), unsafeCSS(iconStyles)];

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
    const iconName = VARIANT_ICONS[variant];

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
          <i
            class="lui-solid lui-${iconName} alert__icon"
            aria-hidden="true"
          ></i>
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
