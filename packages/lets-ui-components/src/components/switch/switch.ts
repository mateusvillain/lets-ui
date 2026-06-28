import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './switch.scss?inline';

export class LuiSwitch extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  @property() label = '';
  @property() name = '';
  @property() value = 'on';
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property() size = 'lg';
  @property({ attribute: 'aria-label' }) ariaLabel = '';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText = 'Campo obrigatório.';

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-switch-${Math.random().toString(36).slice(2, 9)}`;
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.setFormValue(this.checked ? this.value : null);
    this.addEventListener('invalid', () => {
      this.error = true;
    });
  }

  protected firstUpdated() {
    this._syncFormValue();
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('checked')) {
      this._syncFormValue();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.checked = false;
    this.error = false;
  }

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'lg';
  }

  private _syncFormValue() {
    this._internals.setFormValue(this.checked ? this.value : null);
    if (this.required && !this.checked) {
      this._internals.setValidity({ valueMissing: true }, 'Campo obrigatório.');
    } else {
      this._internals.setValidity({});
    }
  }

  private _handleChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    if (this.checked) this.error = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  render() {
    const ariaLabel = this.ariaLabel || this.label || 'Switch';
    return html`
      <div class="switch-field${this.error ? ' switch-field--error' : ''}">
        <label class="switch switch--${this._size}">
          <input
            id="${this._baseId}-input"
            type="checkbox"
            role="switch"
            name="${ifDefined(this.name || undefined)}"
            .value="${this.value}"
            aria-label="${ariaLabel}"
            aria-checked="${this.checked}"
            .checked="${this.checked}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            ?aria-disabled="${this.disabled}"
            aria-invalid="${this.error ? 'true' : 'false'}"
            aria-required="${this.required ? 'true' : 'false'}"
            aria-describedby="${ifDefined(
              this.error ? `${this._baseId}-error` : undefined
            )}"
            @change="${this._handleChange}"
          />
          <slot>${this.label}</slot>
        </label>
        ${this.error && this.errorText
          ? html`<p id="${this._baseId}-error" class="switch-field__message">
              ${this.errorText}
            </p>`
          : ''}
      </div>
    `;
  }
}
