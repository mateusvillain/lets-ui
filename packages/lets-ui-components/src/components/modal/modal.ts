import { LitElement, html, unsafeCSS } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scroll-lock.js';
import styles from './modal.scss?inline';

export class LuiModal extends LitElement {
  static styles = unsafeCSS(styles);

  @property() title = 'Modal title';
  @property() size = 'md';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ attribute: 'trigger-label' }) triggerLabel = 'Open modal';
  @property({ attribute: 'hide-trigger', type: Boolean }) hideTrigger = false;

  @query('[data-modal-dialog]') private _dialog!: HTMLElement;
  @query('[data-modal-backdrop]') private _backdrop!: HTMLElement;

  @state() private _hasTriggerSlot = false;
  @state() private _hasActionsSlot = false;

  private _baseId: string;
  private _handleDocumentKeydown!: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this._baseId = `lui-modal-${Math.random().toString(36).slice(2, 9)}`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleDocumentKeydown = (event: KeyboardEvent) => {
      if (!this.open) return;
      if (event.key === 'Escape') {
        this.closeModal();
        return;
      }
      if (event.key === 'Tab') {
        this._trapFocus(event);
      }
    };
    document.addEventListener('keydown', this._handleDocumentKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleDocumentKeydown);
    if (this.open) unlockBodyScroll();
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('open')) {
      if (this.open && this._dialog) {
        requestAnimationFrame(() => this._dialog.focus());
      }
    }
  }

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'md';
  }

  openModal() {
    // Close other open modals
    const openedModals = Array.from(
      document.querySelectorAll<LuiModal>('lui-modal')
    ).filter((modal) => modal !== this && modal.open);
    openedModals.forEach((modal) => modal.closeModal());

    this.open = true;
    lockBodyScroll();
  }

  closeModal() {
    this.open = false;
    unlockBodyScroll();
  }

  private _trapFocus(event: KeyboardEvent) {
    const dialog = this._dialog;
    if (!dialog) return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled'));

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = this.shadowRoot?.activeElement ?? document.activeElement;

    if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    }
  }

  private _handleTriggerSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasTriggerSlot = slot.assignedNodes({ flatten: true }).length > 0;
  }

  private _handleActionsSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasActionsSlot = slot.assignedNodes({ flatten: true }).length > 0;
  }

  private _handleBackdropClick(e: MouseEvent) {
    if (e.target === this._backdrop) {
      this.closeModal();
    }
  }

  render() {
    const size = this._size;
    return html`
      ${this._hasTriggerSlot
        ? html`<slot
            name="trigger"
            @slotchange="${this._handleTriggerSlotChange}"
            @click="${this.openModal}"
          ></slot>`
        : this.hideTrigger
          ? html`<slot
              name="trigger"
              style="display:none"
              @slotchange="${this._handleTriggerSlotChange}"
            ></slot>`
          : html`
              <button
                type="button"
                class="btn btn--primary btn--lg"
                aria-haspopup="dialog"
                aria-controls="${this._baseId}-dialog"
                aria-expanded="${this.open ? 'true' : 'false'}"
                @click="${this.openModal}"
              >
                ${this.triggerLabel}
              </button>
              <slot
                name="trigger"
                style="display:none"
                @slotchange="${this._handleTriggerSlotChange}"
              ></slot>
            `}

      <div
        data-modal-backdrop
        aria-hidden="${this.open ? 'false' : 'true'}"
        style="
          position: fixed;
          inset: 0;
          z-index: 1040;
          display: ${this.open ? 'flex' : 'none'};
          align-items: center;
          justify-content: center;
          background: rgb(0 0 0 / 40%);
          padding: 16px;
        "
        @click="${this._handleBackdropClick}"
      >
        <div
          id="${this._baseId}-dialog"
          data-modal-dialog
          class="modal modal--${size}"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="${this._baseId}-title"
          aria-describedby="${this._baseId}-body"
        >
          <div class="modal__header">
            <span id="${this._baseId}-title" class="modal__title"
              >${this.title}</span
            >
            <button
              type="button"
              class="icon-button icon-button--lg"
              aria-label="Fechar modal"
              @click="${this.closeModal}"
            >
              <i class="lui lui-x" aria-hidden="true"></i>
            </button>
          </div>
          <div id="${this._baseId}-body" class="modal__body">
            <slot></slot>
          </div>
          <div
            class="modal__footer"
            style="${this._hasActionsSlot ? '' : 'display:none'}"
          >
            <slot
              name="actions"
              @slotchange="${this._handleActionsSlotChange}"
            ></slot>
          </div>
        </div>
      </div>
    `;
  }
}
