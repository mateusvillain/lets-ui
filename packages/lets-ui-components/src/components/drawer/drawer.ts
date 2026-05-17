import { LitElement, html, unsafeCSS } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scroll-lock.js';
import styles from './drawer.scss?inline';

export class LuiDrawer extends LitElement {
  static styles = unsafeCSS(styles);

  @property() title = 'Drawer title';
  @property() size = 'md';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ attribute: 'trigger-label' }) triggerLabel = 'Abrir drawer';
  @property({ attribute: 'hide-trigger', type: Boolean }) hideTrigger = false;
  @property({ attribute: 'close-on-backdrop', type: Boolean }) closeOnBackdrop =
    false;

  @query('[data-drawer-panel]') private _panel!: HTMLElement;
  @query('[data-drawer-backdrop]') private _backdrop!: HTMLElement;

  @state() private _hasTriggerSlot = false;
  @state() private _hasActionsSlot = false;

  private _baseId: string;
  private _handleDocumentKeydown!: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this._baseId = `lui-drawer-${Math.random().toString(36).slice(2, 9)}`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleDocumentKeydown = (event: KeyboardEvent) => {
      if (!this.open) return;
      if (event.key === 'Escape') {
        this.closeDrawer();
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
      this._syncOpenState(changedProps.get('open') !== undefined);
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

  openDrawer() {
    this.open = true;
  }

  closeDrawer() {
    this.open = false;
  }

  private _syncOpenState(animate: boolean) {
    const panel = this._panel;
    const backdrop = this._backdrop;

    if (!panel || !backdrop) return;

    if (this.open) {
      panel.removeAttribute('inert');
      panel.setAttribute('aria-hidden', 'false');
      lockBodyScroll();

      if (animate) {
        requestAnimationFrame(() => {
          backdrop.classList.add('is-open');
          panel.classList.add('is-open');
        });
      } else {
        backdrop.classList.add('is-open');
        panel.classList.add('is-open');
      }

      requestAnimationFrame(() => panel.focus());
    } else {
      backdrop.classList.remove('is-open');
      panel.classList.remove('is-open');
      unlockBodyScroll();

      setTimeout(
        () => {
          if (!this.open) {
            panel.setAttribute('inert', '');
            panel.setAttribute('aria-hidden', 'true');
          }
        },
        animate ? 300 : 0
      );
    }
  }

  private _trapFocus(event: KeyboardEvent) {
    const panel = this._panel;
    if (!panel) return;

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
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
    if (this.closeOnBackdrop && e.target === this._backdrop) {
      this.closeDrawer();
    }
  }

  render() {
    const size = this._size;
    return html`
      ${this._hasTriggerSlot
        ? html`<slot
            name="trigger"
            @slotchange="${this._handleTriggerSlotChange}"
            @click="${this.openDrawer}"
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
                aria-controls="${this._baseId}-panel"
                aria-expanded="${this.open ? 'true' : 'false'}"
                @click="${this.openDrawer}"
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
        data-drawer-backdrop
        class="drawer-backdrop"
        aria-hidden="true"
        @click="${this._handleBackdropClick}"
      ></div>

      <div
        id="${this._baseId}-panel"
        data-drawer-panel
        class="drawer drawer--${size}"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${this._baseId}-title"
        aria-hidden="true"
        inert
      >
        <div class="drawer__header">
          <span id="${this._baseId}-title" class="drawer__title"
            >${this.title}</span
          >
          <button
            type="button"
            class="drawer__close"
            aria-label="Fechar drawer"
            @click="${this.closeDrawer}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M17.4697 5.46973C17.7626 5.17683 18.2373 5.17683 18.5302 5.46973C18.8231 5.76262 18.8231 6.23738 18.5302 6.53027L13.0605 12L18.5302 17.4697C18.8231 17.7626 18.8231 18.2374 18.5302 18.5303C18.2373 18.8232 17.7626 18.8232 17.4697 18.5303L11.9999 13.0605L6.53022 18.5303C6.23732 18.8232 5.76256 18.8232 5.46967 18.5303C5.17678 18.2374 5.17678 17.7626 5.46967 17.4697L10.9394 12L5.46967 6.53027C5.17678 6.23738 5.17678 5.76262 5.46967 5.46973C5.76256 5.17683 6.23732 5.17683 6.53022 5.46973L11.9999 10.9395L17.4697 5.46973Z"
              />
            </svg>
          </button>
        </div>

        <div class="drawer__body">
          <slot></slot>
        </div>

        <div
          class="drawer__footer"
          style="${this._hasActionsSlot ? '' : 'display:none'}"
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
