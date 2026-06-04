import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './radio-group.scss?inline';
import { LuiRadio } from '../radio/radio.js';

export class LuiRadioGroup extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;
  private _value = '';

  @property() name = '';
  @property() label = '';
  @property() size = 'lg';
  @property() form = '';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;
  @property() hint = '';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText = 'Selecione uma opção.';

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('invalid', () => {
      this.error = true;
    });
    this.addEventListener('change', this._handleRadioChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('change', this._handleRadioChange);
  }

  protected firstUpdated() {
    this._applyToRadios();
    this._initFromChildren();
    this._syncFormValue();
  }

  get _size(): 'lg' | 'md' {
    return this.size === 'md' ? 'md' : 'lg';
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('disabled') || changed.has('size')) {
      this._applyToRadios();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this._value = '';
    this.error = false;
    this._getRadios().forEach((r) => {
      r.checked = false;
    });
    this._internals.setFormValue(null);
    this._internals.setValidity({});
    this.requestUpdate();
  }

  private _getRadios(): LuiRadio[] {
    return Array.from(this.querySelectorAll<LuiRadio>('lui-radio'));
  }

  private _initFromChildren() {
    const checked = this._getRadios().find((r) => r.checked);
    if (checked) this._value = checked.value;
  }

  private _syncFormValue() {
    this._internals.setFormValue(this._value || null);
    if (this.required && !this._value) {
      this._internals.setValidity({ valueMissing: true }, this.errorText);
    } else {
      this._internals.setValidity({});
    }
  }

  private _handleRadioChange = (e: Event) => {
    const radio = e.target;
    if (!(radio instanceof LuiRadio) || !this.contains(radio)) return;
    if (!radio.checked) return;

    this._value = radio.value;
    this.error = false;

    this._getRadios().forEach((r) => {
      if (r !== radio) r.checked = false;
    });

    this._syncFormValue();
    this.requestUpdate();
  };

  private _applyToRadios() {
    this._getRadios().forEach((r) => {
      r.size = this._size;
      if (this.disabled) r.disabled = true;
    });
  }

  private _handleSlotChange() {
    this._applyToRadios();
    this._initFromChildren();
    this._syncFormValue();
  }

  render() {
    return html`
      <fieldset
        class="radio-group radio-group--${this._size}${this.error
          ? ' radio-group--error'
          : ''}"
      >
        ${this.label
          ? html`<legend class="radio-group__legend">${this.label}</legend>`
          : ''}
        ${this.hint ? html`<p class="radio-group__hint">${this.hint}</p>` : ''}
        <div class="radio-group__options">
          <slot @slotchange=${this._handleSlotChange}></slot>
        </div>
        ${this.error && this.errorText
          ? html`<p class="radio-group__message">${this.errorText}</p>`
          : ''}
      </fieldset>
    `;
  }
}
