import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './select.scss?inline';

export class LuiSelect extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  @property() label = '';
  @property() name = '';
  @property() options = 'Option 1,Option 2,Option 3';
  @property({ type: Number }) selected = 0;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property() size = 'lg';
  @property({ type: Boolean }) optional = false;
  @property({ attribute: 'optional-text' }) optionalText = '(opcional)';
  @property() hint = '';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText = 'Campo obrigatório.';
  @property() placeholder = 'Select an option';
  @property({ attribute: 'force-state' }) forceState = '';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  @state() private _selectedIndex = 0;

  @query('.native-select__input') private _selectEl!: HTMLSelectElement;

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-select-${Math.random().toString(36).slice(2, 9)}`;
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    const idx = Number.isFinite(this.selected) ? Math.max(this.selected, 0) : 0;
    const val = idx > 0 ? this._parsedOptions[idx - 1] : null;
    this._internals.setFormValue(val || null);
    this.addEventListener('invalid', () => {
      this.error = true;
    });
  }

  protected firstUpdated() {
    this._syncFormValue();
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('selected')) {
      this._syncFormValue();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.selected = 0;
    this.error = false;
    this._syncFormValue();
  }

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'lg';
  }

  get _parsedOptions(): string[] {
    return this.options
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }

  private _syncFormValue() {
    const idx = Number.isFinite(this.selected) ? Math.max(this.selected, 0) : 0;
    const selectedValue = idx > 0 ? this._parsedOptions[idx - 1] : null;
    this._internals.setFormValue(selectedValue || null);
    if (this.required && !selectedValue) {
      this._internals.setValidity(
        { valueMissing: true },
        this.errorText,
        this._selectEl
      );
    } else {
      this._internals.setValidity({});
    }
  }

  private _handleChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    this._selectedIndex = select.selectedIndex;
    this.selected = select.selectedIndex;
    this.error = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  render() {
    const ariaLabel = this.ariaLabel || this.label || 'Native select';
    const parsedOptions = this._parsedOptions;
    const selectedIndex = Number.isFinite(this.selected)
      ? Math.max(this.selected, 0)
      : 0;
    const hasSelectedOption = selectedIndex > 0;
    const message = this.error ? this.errorText : this.hint;
    const describedBy = message ? `${this._baseId}-message` : '';
    const forceStateClass =
      this.forceState === 'hovered'
        ? ' native-select--force-hover'
        : this.forceState === 'focused'
          ? ' native-select--force-focus'
          : '';

    return html`
      <div
        class="native-select native-select--${this._size}${this.disabled
          ? ' native-select--disabled'
          : ''}${this.error ? ' native-select--error' : ''}${!hasSelectedOption
          ? ' native-select--placeholder'
          : ''}${forceStateClass}"
      >
        <div class="native-select__head">
          <div class="native-select__label-wrap">
            <label for="${this._baseId}-input">${this.label}</label>
            ${this.optional
              ? html`<span class="native-select__optional"
                  >${this.optionalText}</span
                >`
              : ''}
          </div>
        </div>

        <div class="native-select__control">
          <select
            class="native-select__input"
            id="${this._baseId}-input"
            name="${ifDefined(this.name || undefined)}"
            aria-label="${ariaLabel}"
            aria-describedby="${describedBy}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            ?aria-disabled="${this.disabled}"
            @change="${this._handleChange}"
          >
            <option value="" ?selected="${!hasSelectedOption}" disabled hidden>
              ${this.placeholder}
            </option>
            ${parsedOptions.map(
              (option, index) => html`
                <option
                  value="${option}"
                  ?selected="${index + 1 === selectedIndex}"
                >
                  ${option}
                </option>
              `
            )}
          </select>
          <span class="native-select__arrow" aria-hidden="true">
            <svg viewBox="0 0 14 7" focusable="false">
              <path d="M1 1L7 6L13 1"></path>
            </svg>
          </span>
        </div>

        ${message
          ? html`<p id="${this._baseId}-message" class="native-select__message">
              ${message}
            </p>`
          : ''}
      </div>
    `;
  }
}

export class LuiNativeSelect extends LuiSelect {}
