import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './textarea.scss?inline';

export class LuiTextarea extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property() placeholder = '';
  @property() size = 'lg';
  @property() value = '';
  @property({ type: Boolean }) disabled = false;
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

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-textarea-${Math.random().toString(36).slice(2, 9)}`;
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

  private _handleInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this._charCount = textarea.value.length;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private _handleChange() {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

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
            aria-label="${ariaLabel}"
            aria-describedby="${describedBy}"
            placeholder="${this.placeholder}"
            rows="${this.rows}"
            style="resize: ${this._resizeValue};"
            maxlength="${maxLen !== null ? maxLen : ''}"
            ?disabled="${this.disabled}"
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
