import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './textarea.scss?inline';

export class LuiTextarea extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  @property() label = '';
  @property() placeholder = '';
  @property() size = 'lg';
  @property() name = '';
  @property() value = '';
  @property() form = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) optional = false;
  @property({ attribute: 'optional-text' }) optionalText = '(opcional)';
  @property() hint = '';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText = 'Campo obrigatório.';
  @property() maxlength = '';
  @property() rows = '4';
  @property() resize = 'vertical';
  @property({ attribute: 'force-state' }) forceState = '';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  @state() private _charCount = 0;

  @query('.textarea-field__input') private _textareaEl!: HTMLTextAreaElement;

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-textarea-${Math.random().toString(36).slice(2, 9)}`;
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.setFormValue(this.value || null);
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

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.value = '';
    this._charCount = 0;
    this.error = false;
    if (this._textareaEl) this._textareaEl.value = '';
    this._internals.setFormValue(null);
    this._internals.setValidity({});
  }

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'lg';
  }

  get _maxLength(): number | null {
    if (!this.maxlength) return null;
    const n = Number(this.maxlength);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
  }

  get _resizeValue(): 'none' | 'both' | 'vertical' {
    return this.resize === 'none'
      ? 'none'
      : this.resize === 'both'
        ? 'both'
        : 'vertical';
  }

  private _syncFormValue() {
    const val = this._textareaEl?.value ?? '';
    this._internals.setFormValue(val || null);
    if (this.required && !val.trim()) {
      this._internals.setValidity(
        { valueMissing: true },
        this.errorText,
        this._textareaEl
      );
    } else {
      this._internals.setValidity({});
    }
  }

  private _handleInput = (e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    this._charCount = textarea.value.length;
    this.error = false;
    this._syncFormValue();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  private _handleChange = () => {
    this.error = false;
    this._syncFormValue();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  render() {
    const ariaLabel = this.ariaLabel || this.label || 'Textarea';
    const maxLen = this._maxLength;
    const counterEnabled = maxLen !== null;
    const message = this.error ? this.errorText : this.hint;
    const describedBy = message ? `${this._baseId}-message` : '';
    const forceStateClass =
      this.forceState === 'hovered'
        ? ' textarea-field--force-hover'
        : this.forceState === 'focused'
          ? ' textarea-field--force-focus'
          : '';
    const charCount = this._charCount || this.value.length;

    return html`
      <div
        class="textarea-field textarea-field--${this._size}${this.disabled
          ? ' textarea-field--disabled'
          : ''}${this.error ? ' textarea-field--error' : ''}${forceStateClass}"
      >
        <div class="textarea-field__head">
          <div class="textarea-field__label-wrap">
            <label for="${this._baseId}-input">${this.label}</label>
            ${this.optional
              ? html`<span class="textarea-field__optional"
                  >${this.optionalText}</span
                >`
              : ''}
          </div>
          ${counterEnabled
            ? html`<span class="textarea-field__counter"
                >${charCount}/${maxLen}</span
              >`
            : ''}
        </div>

        <label class="textarea-field__control" for="${this._baseId}-input">
          <textarea
            class="textarea-field__input"
            id="${this._baseId}-input"
            name="${ifDefined(this.name || undefined)}"
            aria-label="${ariaLabel}"
            aria-describedby="${describedBy}"
            placeholder="${this.placeholder}"
            rows="${this.rows}"
            style="resize: ${this._resizeValue};"
            maxlength="${maxLen !== null ? maxLen : ''}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            ?aria-disabled="${this.disabled}"
            @input="${this._handleInput}"
            @change="${this._handleChange}"
          >
${this.value}</textarea
          >
        </label>

        ${message
          ? html`<p
              id="${this._baseId}-message"
              class="textarea-field__message"
            >
              ${message}
            </p>`
          : ''}
      </div>
    `;
  }
}
