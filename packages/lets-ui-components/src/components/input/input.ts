import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './input.scss?inline';

const EYE_CLOSED = html`
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path d="M3 3L21 21"></path>
    <path
      d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42"
    ></path>
    <path
      d="M9.88 5.09C10.56 4.86 11.27 4.75 12 4.75C19 4.75 22.5 12 22.5 12C21.95 13.03 21.29 13.96 20.54 14.76"
    ></path>
    <path
      d="M6.05 6.05C4.28 7.26 2.92 9.05 1.5 12C1.5 12 5 19.25 12 19.25C13.95 19.25 15.64 18.69 17.09 17.84"
    ></path>
  </svg>
`;

const EYE_OPEN = html`
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path
      d="M1.5 12C1.5 12 5 4.75 12 4.75C19 4.75 22.5 12 22.5 12C22.5 12 19 19.25 12 19.25C5 19.25 1.5 12 1.5 12Z"
    ></path>
    <circle cx="12" cy="12" r="3.5"></circle>
  </svg>
`;

const ICON_MINUS = html`
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path d="M5 12H19"></path>
  </svg>
`;

const ICON_PLUS = html`
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path d="M12 5V19"></path>
    <path d="M5 12H19"></path>
  </svg>
`;

export class LuiInput extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  @property() label = '';
  @property() placeholder = '';
  @property() size = 'lg';
  @property() type = 'text';
  @property() name = '';
  @property() value = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) optional = false;
  @property({ attribute: 'optional-text' }) optionalText = '(opcional)';
  @property() hint = '';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText = 'Campo obrigatório.';
  @property() maxlength = '';
  @property() prefix = '';
  @property() suffix = '';
  @property({ attribute: 'force-state' }) forceState = '';
  @property() min = '';
  @property() max = '';
  @property() step = '';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  @state() private _passwordVisible = false;
  @state() private _charCount = 0;

  @query('.input-field__input') private _inputEl!: HTMLInputElement;

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-input-${Math.random().toString(36).slice(2, 9)}`;
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.setFormValue(this.value);
    this.addEventListener('invalid', () => {
      this.error = true;
    });
  }

  protected firstUpdated() {
    this._syncFormValue();
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('value')) {
      this._syncFormValue();
    }
  }

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'lg';
  }

  get _inputType(): 'text' | 'password' | 'number' {
    const t = this.type.toLowerCase();
    return t === 'password' || t === 'number'
      ? (t as 'password' | 'number')
      : 'text';
  }

  get _maxLength(): number | null {
    if (!this.maxlength) return null;
    const n = Number(this.maxlength);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
  }

  get _stepValue(): number {
    if (!this.step) return 1;
    const n = Number(this.step);
    return Number.isFinite(n) ? n : 1;
  }

  private _parseNumber(val: string): number | null {
    if (!val) return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }

  private _clampNumber(rawValue: string): number {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) return this._parseNumber(this.min) ?? 0;
    const minVal = this._parseNumber(this.min);
    const maxVal = this._parseNumber(this.max);
    let next = parsed;
    if (minVal !== null) next = Math.max(minVal, next);
    if (maxVal !== null) next = Math.min(maxVal, next);
    return next;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.value = '';
    this._charCount = 0;
    this.error = false;
    if (this._inputEl) this._inputEl.value = '';
    this._internals.setFormValue(null);
    this._internals.setValidity({});
  }

  private _syncFormValue() {
    const val = this._inputEl?.value ?? '';
    this._internals.setFormValue(val || null);
    if (this.required && !val.trim()) {
      this._internals.setValidity(
        { valueMissing: true },
        this.errorText,
        this._inputEl
      );
    } else {
      this._internals.setValidity({});
    }
  }

  private _handleInput() {
    if (this._inputType === 'number') {
      this._inputEl.value = String(this._clampNumber(this._inputEl.value));
    }
    this._charCount = this._inputEl.value.length;
    this.error = false;
    this._syncFormValue();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private _handleChange() {
    if (this._inputType === 'number') {
      this._inputEl.value = String(this._clampNumber(this._inputEl.value));
    }
    this.error = false;
    this._syncFormValue();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  private _togglePassword() {
    this._passwordVisible = !this._passwordVisible;
  }

  private _applyStep(delta: number) {
    const current = this._clampNumber(this._inputEl?.value ?? '');
    const next = this._clampNumber(String(current + delta * this._stepValue));
    if (this._inputEl) this._inputEl.value = String(next);
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  private _renderRegularInput(ariaLabel: string, describedBy: string) {
    const isPassword = this._inputType === 'password';
    const inputRealType = isPassword
      ? this._passwordVisible
        ? 'text'
        : 'password'
      : 'text';
    const maxLen = this._maxLength;

    return html`
      <label class="input-field__control" for="${this._baseId}-input">
        ${!isPassword && this.prefix
          ? html`<span class="input-field__prefix">${this.prefix}</span>`
          : ''}
        <input
          class="input-field__input"
          id="${this._baseId}-input"
          type="${inputRealType}"
          name="${ifDefined(this.name || undefined)}"
          aria-label="${ariaLabel}"
          aria-describedby="${describedBy}"
          placeholder="${this.placeholder}"
          .value="${this.value}"
          maxlength="${maxLen !== null ? maxLen : ''}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          ?aria-disabled="${this.disabled}"
          @input="${this._handleInput}"
          @change="${this._handleChange}"
        />
        ${isPassword
          ? html`
              <button
                type="button"
                class="input-field__action"
                aria-label="${this._passwordVisible
                  ? 'Ocultar senha'
                  : 'Mostrar senha'}"
                ?disabled="${this.disabled}"
                @click="${this._togglePassword}"
              >
                ${this._passwordVisible ? EYE_CLOSED : EYE_OPEN}
              </button>
            `
          : ''}
        ${!isPassword && this.suffix
          ? html`<span class="input-field__suffix">${this.suffix}</span>`
          : ''}
      </label>
    `;
  }

  private _renderNumberInput(ariaLabel: string, describedBy: string) {
    const minVal = this._parseNumber(this.min);
    const maxVal = this._parseNumber(this.max);

    return html`
      <label
        class="input-field__control input-field__control--number"
        for="${this._baseId}-input"
      >
        <button
          type="button"
          class="input-field__step"
          aria-label="Diminuir valor"
          ?disabled="${this.disabled}"
          @click="${() => this._applyStep(-1)}"
        >
          ${ICON_MINUS}
        </button>
        <input
          class="input-field__input input-field__input--number"
          id="${this._baseId}-input"
          type="number"
          name="${ifDefined(this.name || undefined)}"
          aria-label="${ariaLabel}"
          aria-describedby="${describedBy}"
          .value="${this.value || '1'}"
          step="${this._stepValue}"
          min="${minVal !== null ? minVal : ''}"
          max="${maxVal !== null ? maxVal : ''}"
          ?disabled="${this.disabled}"
          ?required="${this.required}"
          ?aria-disabled="${this.disabled}"
          @input="${this._handleInput}"
          @change="${this._handleChange}"
        />
        <button
          type="button"
          class="input-field__step"
          aria-label="Aumentar valor"
          ?disabled="${this.disabled}"
          @click="${() => this._applyStep(1)}"
        >
          ${ICON_PLUS}
        </button>
      </label>
    `;
  }

  render() {
    const inputType = this._inputType;
    const ariaLabel = this.ariaLabel || this.label || 'Input';
    const maxLen = this._maxLength;
    const counterEnabled = inputType !== 'number' && maxLen !== null;
    const message = this.error ? this.errorText : this.hint;
    const describedBy = message ? `${this._baseId}-message` : '';
    const forceStateClass =
      this.forceState === 'hovered'
        ? ' input-field--force-hover'
        : this.forceState === 'focused'
          ? ' input-field--force-focus'
          : '';
    const typeClass = ` input-field--type-${inputType}`;
    const charCount = this._charCount || this.value.length;

    const inputHtml =
      inputType === 'number'
        ? this._renderNumberInput(ariaLabel, describedBy)
        : this._renderRegularInput(ariaLabel, describedBy);

    return html`
      <div
        class="input-field input-field--${this._size}${typeClass}${this.disabled
          ? ' input-field--disabled'
          : ''}${this.error ? ' input-field--error' : ''}${this.prefix
          ? ' input-field--with-prefix'
          : ''}${this.suffix
          ? ' input-field--with-suffix'
          : ''}${forceStateClass}"
      >
        <div class="input-field__head">
          <div class="input-field__label-wrap">
            <label for="${this._baseId}-input">${this.label}</label>
            ${this.optional
              ? html`<span class="input-field__optional"
                  >${this.optionalText}</span
                >`
              : ''}
          </div>
          ${counterEnabled
            ? html`<span class="input-field__counter"
                >${charCount}/${maxLen}</span
              >`
            : ''}
        </div>

        ${inputHtml}
        ${message
          ? html`<p id="${this._baseId}-message" class="input-field__message">
              ${message}
            </p>`
          : ''}
      </div>
    `;
  }
}
