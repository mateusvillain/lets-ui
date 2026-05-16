import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './card.scss?inline';

export class LuiCard extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ attribute: 'aria-label' }) ariaLabel = 'Card';

  @state() private _hasCover = false;
  @state() private _hasActions = false;

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-card-${Math.random().toString(36).slice(2, 9)}`;
  }

  private _handleCoverSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasCover = slot.assignedNodes({ flatten: true }).length > 0;
  }

  private _handleActionsSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasActions = slot.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    return html`
      <article
        class="card card--border"
        aria-label="${this.ariaLabel}"
        id="${this._baseId}"
      >
        ${this._hasCover
          ? html`
              <div class="card__cover">
                <slot
                  name="cover"
                  @slotchange="${this._handleCoverSlotChange}"
                ></slot>
              </div>
            `
          : html`<slot
              name="cover"
              style="display:none"
              @slotchange="${this._handleCoverSlotChange}"
            ></slot>`}
        <div class="card__body">
          <slot></slot>
          <div
            class="card__actions"
            role="group"
            aria-label="Card actions"
            style="${this._hasActions ? '' : 'display:none'}"
          >
            <slot
              name="actions"
              @slotchange="${this._handleActionsSlotChange}"
            ></slot>
          </div>
        </div>
      </article>
    `;
  }
}
