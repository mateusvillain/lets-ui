import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './radio-group.scss?inline';
import { LuiRadio } from '../radio/radio.js';

export class LuiRadioGroup extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;
  private _baseId: string;
  private _value = '';

  @property() name = '';
  @property() label = '';
  @property() size = 'lg';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;
  @property() hint = '';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText = 'Selecione uma opção.';

  constructor() {
    super();
    this._baseId = `lui-radio-group-${Math.random().toString(36).slice(2, 9)}`;
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('invalid', () => {
      this.error = true;
    });
    this.addEventListener('change', this._handleRadioChange);
    this.addEventListener('keydown', this._handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('change', this._handleRadioChange);
    this.removeEventListener('keydown', this._handleKeydown);
  }

  protected firstUpdated() {
    this._applyToRadios();
    this._initFromChildren();
    this._syncFormValue();
    this._initRovingTabIndex();
  }

  get _size(): 'lg' | 'md' {
    return this.size === 'md' ? 'md' : 'lg';
  }

  protected updated(changed: PropertyValues) {
    if (
      changed.has('disabled') ||
      changed.has('size') ||
      changed.has('error')
    ) {
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
      r.error = false;
    });
    this._internals.setFormValue(null);
    this._internals.setValidity({});
    this.requestUpdate();
  }

  private _getRadios(): LuiRadio[] {
    return Array.from(this.querySelectorAll<LuiRadio>('lui-radio'));
  }

  private _getEnabledRadios(): LuiRadio[] {
    return this._getRadios().filter((r) => !r.disabled);
  }

  private _initRovingTabIndex() {
    const radios = this._getRadios();
    const active =
      radios.find((r) => r.checked) ?? radios.find((r) => !r.disabled);
    radios.forEach((r) => {
      r.inputTabIndex = r === active ? 0 : -1;
    });
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
      if (r !== radio) {
        r.checked = false;
        r.inputTabIndex = -1;
      } else {
        r.inputTabIndex = 0;
      }
    });

    this._syncFormValue();
    this.requestUpdate();
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    const navKeys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', ' '];
    if (!navKeys.includes(e.key)) return;

    const target = e.target;
    if (!(target instanceof LuiRadio) || !this.contains(target)) return;

    e.preventDefault();

    if (e.key === ' ') {
      if (!target.checked && !target.disabled) {
        target.checked = true;
        target.dispatchEvent(
          new Event('change', { bubbles: true, composed: true })
        );
      }
      return;
    }

    const enabled = this._getEnabledRadios();
    if (enabled.length === 0) return;

    const currentIndex = enabled.indexOf(target);
    const isForward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    const direction = isForward ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + enabled.length) % enabled.length;
    const next = enabled[nextIndex];

    this._getRadios().forEach((r) => {
      r.checked = r === next;
      r.inputTabIndex = r === next ? 0 : -1;
    });

    this._value = next.value;
    this.error = false;
    this._syncFormValue();
    next.focus();
    this.requestUpdate();
  };

  private _applyToRadios() {
    this._getRadios().forEach((r) => {
      r.size = this._size;
      if (this.disabled) r.disabled = true;
      r.error = this.error;
    });
  }

  private _handleSlotChange() {
    this._applyToRadios();
    this._initFromChildren();
    this._syncFormValue();
    this._initRovingTabIndex();
  }

  render() {
    const describedBy =
      this.error && this.errorText
        ? `${this._baseId}-error`
        : this.hint
          ? `${this._baseId}-hint`
          : undefined;

    return html`
      <fieldset
        role="radiogroup"
        class="radio-group radio-group--${this._size}${this.error
          ? ' radio-group--error'
          : ''}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required ? 'true' : 'false'}"
        aria-describedby="${ifDefined(describedBy)}"
      >
        ${this.label
          ? html`<legend class="radio-group__legend">${this.label}</legend>`
          : ''}
        ${this.hint
          ? html`<p id="${this._baseId}-hint" class="radio-group__hint">
              ${this.hint}
            </p>`
          : ''}
        <div class="radio-group__options">
          <slot @slotchange=${this._handleSlotChange}></slot>
        </div>
        ${this.error && this.errorText
          ? html`<p id="${this._baseId}-error" class="radio-group__message">
              ${this.errorText}
            </p>`
          : ''}
      </fieldset>
    `;
  }
}
