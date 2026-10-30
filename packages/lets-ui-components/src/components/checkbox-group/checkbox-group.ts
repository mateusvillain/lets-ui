import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './checkbox-group.scss?inline';
import { nameProperty } from '../../utils/form.js';
import { LuiCheckbox } from '../checkbox/checkbox.js';

/**
 * Groups `lui-checkbox` options that answer one question.
 *
 * Mirrors `lui-radio-group`, with the differences multiple choice asks for:
 * - The checkboxes keep submitting themselves. The group hands them its
 *   `name`, so the form receives one entry per checked option under that
 *   name — the same `FormData` a native checkbox group produces. The group
 *   submits nothing of its own and only owns validity.
 * - `required` means at least one option is checked.
 * - No roving tabindex: every checkbox is a Tab stop and Space toggles it.
 */
export class LuiCheckboxGroup extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;
  private _baseId: string;
  // Children the group disabled, so lifting `disabled` only re-enables those
  // and leaves the ones disabled on their own untouched.
  private _disabledByGroup = new WeakSet<LuiCheckbox>();

  @property(nameProperty) name = '';
  @property() label = '';
  @property() size = 'lg';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;
  @property() hint = '';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText =
    'Select at least one option.';

  constructor() {
    super();
    this._baseId = `lui-checkbox-group-${Math.random().toString(36).slice(2, 9)}`;
    this._internals = this.attachInternals();
  }

  /** Values of the checked options, in document order. */
  get value(): string[] {
    return this._getCheckboxes()
      .filter((c) => c.checked)
      .map((c) => c.value);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('invalid', this._handleInvalid);
    this.addEventListener('change', this._handleCheckboxChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('invalid', this._handleInvalid);
    this.removeEventListener('change', this._handleCheckboxChange);
  }

  protected firstUpdated() {
    this._applyToCheckboxes();
    this._syncValidity();
  }

  get _size(): 'lg' | 'md' {
    return this.size === 'md' ? 'md' : 'lg';
  }

  protected updated(changed: PropertyValues) {
    if (
      changed.has('name') ||
      changed.has('disabled') ||
      changed.has('size') ||
      changed.has('error')
    ) {
      this._applyToCheckboxes();
    }
    if (changed.has('required') || changed.has('errorText')) {
      this._syncValidity();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.error = false;
    this._getCheckboxes().forEach((c) => {
      c.checked = false;
      c.error = false;
    });
    this._syncValidity();
  }

  private _getCheckboxes(): LuiCheckbox[] {
    return Array.from(this.querySelectorAll<LuiCheckbox>('lui-checkbox'));
  }

  private _syncValidity() {
    // The checked options carry the values; the group itself has none.
    this._internals.setFormValue(null);
    if (this.required && this.value.length === 0) {
      this._internals.setValidity({ valueMissing: true }, this.errorText);
    } else {
      this._internals.setValidity({});
    }
  }

  private _handleInvalid = () => {
    this.error = true;
  };

  private _handleCheckboxChange = (e: Event) => {
    const checkbox = e.target;
    if (!(checkbox instanceof LuiCheckbox) || !this.contains(checkbox)) return;
    if (this.value.length > 0) this.error = false;
    this._syncValidity();
  };

  private _applyToCheckboxes() {
    this._getCheckboxes().forEach((c) => {
      if (this.name) c.name = this.name;
      c.size = this._size;
      c.error = this.error;
      if (this.disabled) {
        if (!c.disabled) {
          c.disabled = true;
          this._disabledByGroup.add(c);
        }
      } else if (this._disabledByGroup.has(c)) {
        c.disabled = false;
        this._disabledByGroup.delete(c);
      }
    });
  }

  private _handleSlotChange() {
    this._applyToCheckboxes();
    this._syncValidity();
  }

  render() {
    const describedBy =
      [
        this.hint ? `${this._baseId}-hint` : '',
        this.error && this.errorText ? `${this._baseId}-error` : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined;

    return html`
      <fieldset
        class="checkbox-group checkbox-group--${this._size}${this.error
          ? ' checkbox-group--error'
          : ''}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-describedby="${ifDefined(describedBy)}"
      >
        ${this.label
          ? html`<legend class="checkbox-group__legend">${this.label}</legend>`
          : ''}
        ${this.hint
          ? html`<p id="${this._baseId}-hint" class="checkbox-group__hint">
              ${this.hint}
            </p>`
          : ''}
        <div class="checkbox-group__options">
          <slot @slotchange=${this._handleSlotChange}></slot>
        </div>
        ${this.error && this.errorText
          ? html`<p id="${this._baseId}-error" class="checkbox-group__message">
              ${this.errorText}
            </p>`
          : ''}
      </fieldset>
    `;
  }
}
