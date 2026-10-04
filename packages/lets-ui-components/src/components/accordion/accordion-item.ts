import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, state } from 'lit/decorators.js';
import styles from './accordion-item.scss?inline';

export class LuiAccordionItem extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property() subtitle = '';
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Number, attribute: 'heading-level' }) headingLevel?: number;

  // Pushed down by the parent `lui-accordion`; an own `heading-level` wins.
  @property({ attribute: false }) inheritedHeadingLevel = 3;

  @state() private _hasIcon = false;

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-accordion-item-${Math.random().toString(36).slice(2, 9)}`;
  }

  private _handleIconSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasIcon = slot.assignedNodes({ flatten: true }).length > 0;
  }

  // The focusable part is the trigger inside the shadow root, not the host.
  focus(options?: FocusOptions) {
    this.shadowRoot?.querySelector('button')?.focus(options);
  }

  private _toggle() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  private get _level() {
    const level = this.headingLevel ?? this.inheritedHeadingLevel;
    return Math.min(6, Math.max(1, level));
  }

  updated(changed: Map<string, unknown>) {
    // The first update sets `open` from the attribute, which is a starting
    // state and not a toggle. Every later change — a click, the parent closing
    // its siblings, a script — is one.
    if (changed.has('open') && changed.get('open') !== undefined) {
      this.dispatchEvent(
        new CustomEvent('lui-toggle', {
          bubbles: true,
          composed: true,
          detail: { open: this.open },
        })
      );
    }
  }

  render() {
    const triggerId = `${this._baseId}-trigger`;
    const panelId = `${this._baseId}-panel`;

    return html`
      <div
        class="accordion__item ${this.open
          ? 'accordion__item--open'
          : ''} ${this._hasIcon ? 'accordion__item--with-icon' : ''}"
      >
        <div
          class="accordion__heading"
          role="heading"
          aria-level="${this._level}"
        >
          <button
            id="${triggerId}"
            class="accordion__trigger"
            type="button"
            aria-expanded="${this.open ? 'true' : 'false'}"
            aria-controls="${panelId}"
            ?disabled="${this.disabled}"
            aria-disabled="${ifDefined(this.disabled ? 'true' : undefined)}"
            @click="${this._toggle}"
          >
            <span class="accordion__icon" ?hidden="${!this._hasIcon}">
              <slot
                name="icon"
                @slotchange="${this._handleIconSlotChange}"
              ></slot>
            </span>
            <span class="accordion__text">
              <span class="accordion__title">${this.label}</span>
              ${this.subtitle
                ? html`<span class="accordion__subtitle"
                    >${this.subtitle}</span
                  >`
                : nothing}
            </span>
            <svg
              class="accordion__chevron"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              focusable="false"
              aria-hidden="true"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div id="${panelId}" class="accordion__panel">
          <div class="accordion__panel-inner">
            <div class="accordion__description"><slot></slot></div>
          </div>
        </div>
      </div>
    `;
  }
}
