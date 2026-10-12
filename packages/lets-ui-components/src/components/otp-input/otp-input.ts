import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import styles from './otp-input.scss?inline';
import { nameProperty } from '../../utils/form.js';

const DIGIT = /^\d$/;
const VISIBLE = /^\S$/;

export class LuiOtpInput extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  @property({ type: Number }) length = 6;
  @property() type = 'text';
  @property(nameProperty) name = '';
  @property() value = '';
  @property() placeholder = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText = 'This field is required.';
  @property() hint = '';
  @property() label = 'Verification code';
  @property({ attribute: 'field-label' }) fieldLabel =
    'Character {index} of {length}';
  // Boxes per group, split by a separator. Left unset, an even length splits
  // in half (6 → 3 + 3) and an odd one stays a single row; `0` removes it.
  @property({ type: Number, attribute: 'group-size' }) groupSize?: number;

  // One slot per box. Kept apart from `value` because clearing a box in the
  // middle leaves a gap that a plain string cannot hold.
  @state() private _chars: string[] = [];

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-otp-input-${Math.random().toString(36).slice(2, 9)}`;
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('invalid', () => {
      this.error = true;
    });
  }

  get _length(): number {
    return Math.max(1, Math.floor(this.length) || 6);
  }

  get _numeric(): boolean {
    return this.type.toLowerCase() === 'number';
  }

  get _groupSize(): number {
    if (this.groupSize === undefined || this.groupSize === null) {
      return this._length % 2 === 0 ? this._length / 2 : 0;
    }
    return Math.max(0, Math.floor(this.groupSize) || 0);
  }

  get _fields(): HTMLInputElement[] {
    return Array.from(
      this.shadowRoot?.querySelectorAll<HTMLInputElement>(
        '.otp-input__field'
      ) ?? []
    );
  }

  private _sanitize(text: string): string[] {
    const allowed = this._numeric ? DIGIT : VISIBLE;
    return Array.from(text).filter((ch) => allowed.test(ch));
  }

  protected willUpdate(changed: PropertyValues) {
    if (
      this._chars.length !== this._length ||
      changed.has('type') ||
      (changed.has('value') && this.value !== this._chars.join(''))
    ) {
      const chars = this._sanitize(this.value ?? '').slice(0, this._length);
      this._chars = Array.from(
        { length: this._length },
        (_, i) => chars[i] ?? ''
      );
      this.value = this._chars.join('');
    }
  }

  protected updated(changed: PropertyValues) {
    if (
      changed.has('value') ||
      changed.has('required') ||
      changed.has('length')
    ) {
      this._syncFormValue();
    }
  }

  focus(options?: FocusOptions) {
    const fields = this._fields;
    const firstEmpty = this._chars.findIndex((ch) => !ch);
    (fields[firstEmpty] ?? fields[fields.length - 1])?.focus(options);
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.value = '';
    this.error = false;
  }

  private _syncFormValue() {
    const val = this._chars.join('');
    this._internals.setFormValue(val || null);
    const anchor = this._fields[Math.max(0, this._chars.indexOf(''))];
    if (this.required && !val) {
      this._internals.setValidity(
        { valueMissing: true },
        this.errorText,
        anchor
      );
    } else if (val && this._chars.includes('')) {
      this._internals.setValidity({ tooShort: true }, this.errorText, anchor);
    } else {
      this._internals.setValidity({});
    }
  }

  private _focusField(index: number) {
    const fields = this._fields;
    fields[Math.min(Math.max(index, 0), fields.length - 1)]?.focus();
  }

  private _commit(chars: string[]) {
    this._chars = chars;
    this.value = chars.join('');
    this.error = false;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    if (chars.every(Boolean)) {
      this.dispatchEvent(
        new CustomEvent('lui-complete', {
          bubbles: true,
          composed: true,
          detail: { value: this.value },
        })
      );
    }
  }

  // Writes `chars` from `start` onward. A full code goes from the first box,
  // wherever the caret was, so pasting or autofilling it never gets cut short.
  private _distribute(chars: string[], start: number) {
    const from = chars.length >= this._length ? 0 : start;
    const next = [...this._chars];
    chars
      .slice(0, this._length - from)
      .forEach((ch, i) => (next[from + i] = ch));
    this._commit(next);
    this._focusField(from + chars.length);
  }

  private _handleInput(e: InputEvent, index: number) {
    const field = e.target as HTMLInputElement;
    const chars = this._sanitize(field.value);

    if (chars.length > 1) {
      this._distribute(chars, index);
    } else if (chars.length === 1 || !field.value) {
      const next = [...this._chars];
      next[index] = chars[0] ?? '';
      if (next[index] !== this._chars[index]) this._commit(next);
      if (next[index]) this._focusField(index + 1);
    }

    // A rejected character leaves the state untouched, so Lit would not
    // re-render the box; put the stored character back by hand.
    field.value = this._chars[index];
  }

  private _handleKeydown(e: KeyboardEvent, index: number) {
    switch (e.key) {
      case 'Backspace':
        if (this._chars[index] || index === 0) return;
        e.preventDefault();
        this._commit(this._chars.map((ch, i) => (i === index - 1 ? '' : ch)));
        this._focusField(index - 1);
        return;
      case 'ArrowLeft':
        e.preventDefault();
        this._focusField(index - 1);
        return;
      case 'ArrowRight':
        e.preventDefault();
        this._focusField(index + 1);
        return;
      case 'Home':
        e.preventDefault();
        this._focusField(0);
        return;
      case 'End':
        e.preventDefault();
        this._focusField(this._length - 1);
        return;
    }
  }

  private _handlePaste(e: ClipboardEvent, index: number) {
    e.preventDefault();
    const chars = this._sanitize(e.clipboardData?.getData('text') ?? '');
    if (chars.length) this._distribute(chars, index);
  }

  // Selecting the box makes the next keystroke replace its character instead
  // of appending to it.
  private _select(e: Event) {
    (e.target as HTMLInputElement).select();
  }

  private _renderField(index: number, describedBy: string | undefined) {
    const length = this._length;
    const group = this._groupSize;
    const separator =
      group > 0 && (index + 1) % group === 0 && index < length - 1;

    return html`
      <input
        class="otp-input__field"
        id="${this._baseId}-${index}"
        type="text"
        inputmode="${this._numeric ? 'numeric' : 'text'}"
        pattern="${ifDefined(this._numeric ? '[0-9]*' : undefined)}"
        autocomplete="${index === 0 ? 'one-time-code' : 'off'}"
        autocapitalize="off"
        spellcheck="false"
        placeholder="${this.placeholder}"
        aria-label="${this.fieldLabel
          .replace('{index}', String(index + 1))
          .replace('{length}', String(length))}"
        aria-describedby="${ifDefined(describedBy)}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required ? 'true' : 'false'}"
        ?disabled="${this.disabled}"
        .value="${live(this._chars[index] ?? '')}"
        @input="${(e: InputEvent) => this._handleInput(e, index)}"
        @keydown="${(e: KeyboardEvent) => this._handleKeydown(e, index)}"
        @paste="${(e: ClipboardEvent) => this._handlePaste(e, index)}"
        @focus="${this._select}"
        @click="${this._select}"
      />
      ${separator
        ? html`<span class="otp-input__separator" aria-hidden="true"></span>`
        : ''}
    `;
  }

  render() {
    const message = this.error ? this.errorText : this.hint;
    const describedBy = message ? `${this._baseId}-message` : undefined;

    return html`
      <div
        class="otp-input${this.error ? ' otp-input--error' : ''}${this.disabled
          ? ' otp-input--disabled'
          : ''}"
      >
        <div class="otp-input__group" role="group" aria-label="${this.label}">
          ${Array.from({ length: this._length }, (_, i) =>
            this._renderField(i, describedBy)
          )}
        </div>
        ${message
          ? html`<p id="${this._baseId}-message" class="otp-input__message">
              ${message}
            </p>`
          : ''}
      </div>
    `;
  }
}
