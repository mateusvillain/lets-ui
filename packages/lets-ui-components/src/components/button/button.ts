import { LitElement, html, svg, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './button.scss?inline';

const spinnerIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true" class="btn__spinner">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="56.549" stroke-dashoffset="42.412"/>
</svg>`;

export class LuiButton extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  @property() variant = 'primary';
  @property({ reflect: true }) size = 'lg';
  @property() type: 'button' | 'submit' | 'reset' = 'button';
  @property() name = '';
  @property() value = '';
  @property() form = '';
  @property({ type: Boolean }) autofocus = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) block = false;
  @property({ type: Boolean }) loading = false;
  @property({ attribute: 'loading-text' }) loadingText = '';
  @property() label = '';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  get _size(): 'lg' | 'md' {
    return this.size === 'md' ? 'md' : 'lg';
  }

  private get _classes(): string {
    return [
      'btn',
      `btn--${this.variant}`,
      `btn--${this._size}`,
      this.loading && 'btn--loading',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private _handleClick = () => {
    if (this.loading) return;
    const form = this._internals.form ?? this.closest('form');
    if (this.type === 'submit') {
      if (this.name) this._internals.setFormValue(this.value);
      form?.requestSubmit();
      if (this.name) this._internals.setFormValue(null);
    } else if (this.type === 'reset') {
      form?.reset();
    }
  };

  render() {
    const displayLabel =
      this.loading && this.loadingText ? this.loadingText : this.label;
    const isDisabled = this.disabled || this.loading;

    return html`
      <button
        class="${this._classes}"
        type="button"
        ?autofocus="${this.autofocus}"
        aria-label="${ifDefined(this.ariaLabel || displayLabel || undefined)}"
        ?disabled="${this.disabled}"
        aria-disabled="${isDisabled ? 'true' : 'false'}"
        aria-busy="${ifDefined(this.loading ? 'true' : undefined)}"
        @click="${this._handleClick}"
      >
        ${this.loading
          ? html`${spinnerIcon}${displayLabel}`
          : html`<slot name="prefix"></slot><slot>${this.label}</slot
              ><slot name="suffix"></slot>`}
      </button>
    `;
  }
}
