import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './radio.scss?inline';

export class LuiRadio extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  @property() label = '';
  @property() value = '';
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) error = false;
  @property() size = 'lg';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-radio-${Math.random().toString(36).slice(2, 9)}`;
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.setFormValue(this.checked ? this.value : null);
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
    this._internals.setFormValue(null);
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
    this._internals.setValidity({});
  }

  private _uncheckSiblings() {
    const group = this.closest('lui-radio-group');
    if (!group) return;
    group.querySelectorAll('lui-radio').forEach((el) => {
      if (el !== this) (el as LuiRadio).checked = false;
    });
  }

  private _handleChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    if (this.checked) this._uncheckSiblings();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  render() {
    const ariaLabel = this.ariaLabel || this.label || 'Radio';
    return html`
      <label class="radio radio--${this._size}">
        <input
          id="${this._baseId}-input"
          type="radio"
          value="${this.value}"
          aria-label="${ariaLabel}"
          aria-invalid="${this.error ? 'true' : 'false'}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          ?aria-disabled="${this.disabled}"
          @change="${this._handleChange}"
        />
        <slot>${this.label}</slot>
      </label>
    `;
  }
}
