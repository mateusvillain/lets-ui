import { LitElement, html, nothing, unsafeCSS, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import styles from './date-picker.scss?inline';
import { nameProperty } from '../../utils/form.js';
import {
  type DateRange,
  addDays,
  addMonths,
  clampDate,
  endOfMonth,
  isOutOfRange,
  isSameDay,
  isSameMonth,
  monthWeeks,
  parseISODate,
  parseISORange,
  startOfMonth,
  startOfWeek,
  toISODate,
  toISORange,
  today,
} from './date.js';
import {
  type MaskSegment,
  applyMask,
  caretAfterDigits,
  dateMask,
  maskCapacity,
  maskDigits,
  maskPattern,
  rangeMask,
  readMask,
} from './mask.js';

const ICON_CALENDAR = html`
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path
      d="M19.5 10.5H4.5V20.25H19.5V10.5ZM16.5 5.25V6C16.5 6.41 16.16 6.75 15.75 6.75C15.34 6.75 15 6.41 15 6V5.25H9V6C9 6.41 8.66 6.75 8.25 6.75C7.84 6.75 7.5 6.41 7.5 6V5.25H4.5V9H19.5V5.25H16.5ZM21 20.25C21 20.65 20.84 21.03 20.56 21.31C20.28 21.59 19.9 21.75 19.5 21.75H4.5C4.1 21.75 3.72 21.59 3.44 21.31C3.16 21.03 3 20.65 3 20.25V5.25C3 4.85 3.16 4.47 3.44 4.19C3.72 3.91 4.1 3.75 4.5 3.75H7.5V3C7.5 2.59 7.84 2.25 8.25 2.25C8.66 2.25 9 2.59 9 3V3.75H15V3C15 2.59 15.34 2.25 15.75 2.25C16.16 2.25 16.5 2.59 16.5 3V3.75H19.5C19.9 3.75 20.28 3.91 20.56 4.19C20.84 4.47 21 4.85 21 5.25V20.25Z"
    ></path>
  </svg>
`;

const ICON_CHEVRON_LEFT = html`
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path
      d="M13.91 5.47C14.2 5.18 14.67 5.18 14.97 5.47C15.26 5.76 15.26 6.24 14.97 6.53L9.5 12L14.97 17.47C15.26 17.76 15.26 18.24 14.97 18.53C14.67 18.82 14.2 18.82 13.91 18.53L7.91 12.53C7.61 12.24 7.61 11.76 7.91 11.47L13.91 5.47Z"
    ></path>
  </svg>
`;

const ICON_CHEVRON_RIGHT = html`
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path
      d="M10.09 5.47C9.8 5.18 9.33 5.18 9.03 5.47C8.74 5.76 8.74 6.24 9.03 6.53L14.5 12L9.03 17.47C8.74 17.76 8.74 18.24 9.03 18.53C9.33 18.82 9.8 18.82 10.09 18.53L16.09 12.53C16.39 12.24 16.39 11.76 16.09 11.47L10.09 5.47Z"
    ></path>
  </svg>
`;

// Read with `||`: removing the attribute leaves the property null, and the
// text still needs a value.
const DEFAULTS = {
  requiredText: 'Required',
  startLabel: 'Start date',
  endLabel: 'End date',
};

// January 4, 2026 is a Sunday: adding 0–6 days walks a whole week from it.
const REFERENCE_SUNDAY = new Date(2026, 0, 4);

export class LuiDatePicker extends LitElement {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  @property() label = '';
  @property(nameProperty) name = '';
  @property() value = '';
  @property({ type: Boolean, reflect: true }) range = false;
  @property() min = '';
  @property() max = '';
  // Holidays, sold-out days — gaps `min`/`max` can't express since they're a
  // range, not a list. JS only: no attribute reflects a function.
  @property({ attribute: false }) isDateDisabled:
    | ((date: Date) => boolean)
    | null = null;
  @property({ type: Boolean, reflect: true }) editable = false;
  @property() placeholder = '';
  @property() size = 'lg';
  @property() locale = 'en-US';
  @property({ type: Number, attribute: 'first-day-of-week' })
  firstDayOfWeek = 0;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  // Read only without `editable`: a button takes no aria-required, so the
  // field is described as required instead.
  @property({ attribute: 'required-text' }) requiredText =
    DEFAULTS.requiredText;
  @property({ type: Boolean }) optional = false;
  @property({ attribute: 'optional-text' }) optionalText = '(optional)';
  @property() hint = '';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText = 'This field is required.';
  @property({ attribute: 'bad-input-text' }) badInputText =
    'Enter a valid date.';
  // The typed format, as the reader should see it. Empty means the locale's
  // pattern with English letters, like `dd / mm / yyyy`.
  @property({ attribute: 'format-text' }) formatText = '';
  @property({ attribute: 'range-error-text' }) rangeErrorText =
    'Enter a date within the allowed period.';
  // A date `isDateDisabled` names: inside `min`/`max`, but still blocked, so
  // it earns a message of its own rather than reusing `range-error-text`.
  @property({ attribute: 'unavailable-date-text' }) unavailableDateText =
    'This date is unavailable.';
  @property({ attribute: 'range-order-text' }) rangeOrderText =
    "The end date can't be before the start date.";
  @property({ attribute: 'range-start-text' }) rangeStartText =
    'Start date selected. Choose the end date.';
  @property({ attribute: 'dialog-label' }) dialogLabel = 'Choose date';
  @property({ attribute: 'previous-month-label' }) previousMonthLabel =
    'Previous month';
  @property({ attribute: 'next-month-label' }) nextMonthLabel = 'Next month';
  // With `editable range`, `two` types each end in a text box of its own,
  // inside one control that still looks like a single field.
  @property({ attribute: 'range-fields' }) rangeFields = 'one';
  @property({ attribute: 'start-label' }) startLabel = DEFAULTS.startLabel;
  @property({ attribute: 'end-label' }) endLabel = DEFAULTS.endLabel;
  @property({ attribute: 'force-state' }) forceState = '';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  // The day that holds the calendar's single tab stop. The view follows it, so
  // paging and arrowing past an edge both bring the next month on screen.
  @state() private _activeDate: Date = today();
  // The first month on screen; a range shows it and the one after.
  @state() private _viewMonth: Date = startOfMonth(today());
  // A range is picked in two steps. Between them, the first day picked is the
  // anchor and the day under the pointer or the focus is the other end.
  @state() private _anchor: Date | null = null;
  @state() private _preview: Date | null = null;
  // What is typed in the field with `editable`. It runs ahead of `value`,
  // which stays empty until the text spells a whole date.
  @state() private _text = '';
  // The same, one per end, with `range-fields="two"`.
  @state() private _startText = '';
  @state() private _endText = '';

  private _baseId: string;
  // Set once the missing-name warning is logged, so it shows once per field.
  private _warnedNoName = false;
  // Set by user interaction only, so an `open` attribute in the markup shows
  // the calendar without pulling focus into it on page load.
  private _focusActiveDay = false;
  // The control the calendar was opened from, which takes the focus back.
  private _opener: HTMLElement | null = null;
  // Set while typing writes `value`, so the text being typed is not replaced
  // by the formatted value.
  private _typing = false;

  constructor() {
    super();
    this._baseId = `lui-date-picker-${Math.random().toString(36).slice(2, 9)}`;
    this._internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('invalid', this._handleInvalid);
    document.addEventListener('click', this._handleDocumentClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('invalid', this._handleInvalid);
    document.removeEventListener('click', this._handleDocumentClick);
  }

  protected willUpdate(changed: PropertyValues) {
    if (
      (changed.has('value') ||
        changed.has('locale') ||
        changed.has('range') ||
        changed.has('editable') ||
        changed.has('rangeFields')) &&
      !this._typing
    ) {
      const selection = this._selection;
      if (this._split) {
        this._startText = selection ? this._fieldText(selection.start) : '';
        this._endText = selection ? this._fieldText(selection.end) : '';
      } else {
        this._text = selection ? this._maskText(selection) : '';
      }
    }
    // A date typed with the calendar open brings the calendar to it.
    if (changed.has('value') && this._typing && this.open && this._selection) {
      this._activeDate = clampDate(
        this._selection.start,
        this._minDate,
        this._maxDate
      );
    }
    this._typing = false;
    // A field disabled with the calendar open — by its fieldset, say — takes
    // the calendar with it, so no date can be picked while disabled.
    if (changed.has('disabled') && this.disabled) this.open = false;
    if (changed.has('open')) {
      this._anchor = null;
      this._preview = null;
      // Closed without `_close`, by a click outside, say: forget the opener.
      if (!this.open) this._opener = null;
      if (this.open) {
        this._activeDate = clampDate(
          this._selection?.start ?? today(),
          this._minDate,
          this._maxDate
        );
        this._viewMonth = startOfMonth(this._activeDate);
      }
    }
    if (changed.has('_activeDate') || changed.has('range')) {
      this._keepActiveInView();
    }
  }

  protected updated(changed: PropertyValues) {
    // There is no name to fall back on: the placeholder is not a reliable name
    // and a made-up default would describe nothing. Tell the author instead.
    if (!this._warnedNoName && !this.label && !this.ariaLabel) {
      this._warnedNoName = true;
      console.warn(
        'lui-date-picker: set `label` or `aria-label`. Without them the field has no accessible name.',
        this
      );
    }
    if (
      changed.has('value') ||
      changed.has('range') ||
      changed.has('min') ||
      changed.has('max') ||
      changed.has('isDateDisabled') ||
      changed.has('editable') ||
      changed.has('required') ||
      changed.has('errorText') ||
      changed.has('badInputText') ||
      changed.has('rangeErrorText') ||
      changed.has('rangeOrderText') ||
      changed.has('unavailableDateText') ||
      changed.has('rangeFields') ||
      changed.has('_text') ||
      changed.has('_startText') ||
      changed.has('_endText')
    ) {
      this._syncFormValue();
    }
    if (this._focusActiveDay && this.open) {
      this._focusActiveDay = false;
      this.renderRoot
        .querySelector<HTMLElement>('.date-picker-calendar__day[tabindex="0"]')
        ?.focus();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.value = '';
    this._text = '';
    this._startText = '';
    this._endText = '';
    this.error = false;
    this.open = false;
  }

  get _size(): 'lg' | 'md' {
    return this.size === 'md' ? 'md' : 'lg';
  }

  // Two text boxes, one per end of the range.
  get _split() {
    return this.editable && this.range && this.rangeFields === 'two';
  }

  get _monthCount() {
    return this.range ? 2 : 1;
  }

  // A single date reads as a range of one day, so both modes share the
  // validation and the highlighting below.
  get _selection(): DateRange | null {
    if (this.range) return parseISORange(this.value);
    const date = parseISODate(this.value);
    return date ? { start: date, end: date } : null;
  }

  get _minDate() {
    return parseISODate(this.min);
  }

  get _maxDate() {
    return parseISODate(this.max);
  }

  // Text that spells no date — partial or impossible, like February 30.
  get _badInput() {
    if (this._split) {
      // An empty box is a missing end, not bad input.
      const start = this._readField(this._startText);
      const end = this._readField(this._endText);
      const spellsNoDate = (text: string, date: Date | null) =>
        /\d/.test(text) && !date;
      return (
        spellsNoDate(this._startText, start) ||
        spellsNoDate(this._endText, end) ||
        (!!start && !!end && start > end)
      );
    }
    return this.editable && this._text.trim() !== '' && !this._selection;
  }

  // Two whole, real dates typed the wrong way round. It is bad input too, but
  // with a message of its own, since the dates themselves are fine.
  get _reversedRange() {
    if (!this.range || !this._badInput) return false;
    if (this._split) {
      const start = this._readField(this._startText);
      const end = this._readField(this._endText);
      return !!start && !!end && start > end;
    }
    const mask = this._mask;
    const digits = this._text.replace(/\D/g, '');
    const dates =
      digits.length === maskCapacity(mask) ? readMask(digits, mask) : null;
    return !!dates && dates[0] > dates[1];
  }

  // The ends of the current selection `isDateDisabled` names, if any — a
  // holiday typed or pasted straight past the calendar, which only blocks a
  // click. A date is checked at its two ends only: `isDateDisabled` names
  // single days, like `min`/`max` name a border, not every day of a range,
  // so a period is free to run through an unavailable day without landing on
  // one.
  get _unavailableEnds(): { start: boolean; end: boolean } {
    const none = { start: false, end: false };
    const selection = this._selection;
    if (!this.isDateDisabled || !selection) return none;
    return {
      start: this.isDateDisabled(selection.start),
      end: this.range && this.isDateDisabled(selection.end),
    };
  }

  get _hasUnavailableEnd() {
    const ends = this._unavailableEnds;
    return ends.start || ends.end;
  }

  // The validity flag the value breaks, with the message that explains it, in
  // the order the browser would check them.
  get _invalidity(): { flags: ValidityStateFlags; message: string } | null {
    if (this._badInput) {
      return {
        flags: { badInput: true },
        message: this._reversedRange ? this.rangeOrderText : this.badInputText,
      };
    }
    const selection = this._selection;
    if (this.required && !selection) {
      return { flags: { valueMissing: true }, message: this.errorText };
    }
    const min = this._minDate;
    const max = this._maxDate;
    if (selection && min && selection.start < min) {
      return { flags: { rangeUnderflow: true }, message: this.rangeErrorText };
    }
    if (selection && max && selection.end > max) {
      return { flags: { rangeOverflow: true }, message: this.rangeErrorText };
    }
    if (selection && this._hasUnavailableEnd) {
      return {
        flags: { customError: true },
        message: this.unavailableDateText,
      };
    }
    return null;
  }

  // With two text boxes, the ones the error is about: a box that spells no
  // date, the end of a range typed the wrong way round, the end past `max`.
  get _invalidFields(): { start: boolean; end: boolean } {
    const none = { start: false, end: false };
    const both = { start: true, end: true };
    if (!this._split || !this.error) return none;
    const flags = this._invalidity?.flags;
    if (!flags) return both;
    if (flags.badInput) {
      if (this._reversedRange) return { start: false, end: true };
      return {
        start: !this._readField(this._startText),
        end: !this._readField(this._endText),
      };
    }
    if (flags.rangeUnderflow) return { start: true, end: false };
    if (flags.rangeOverflow) return { start: false, end: true };
    if (flags.customError) return this._unavailableEnds;
    if (flags.valueMissing) {
      return {
        start: !this._readField(this._startText),
        end: !this._readField(this._endText),
      };
    }
    return both;
  }

  // The control that opens the calendar and takes the focus back when it
  // closes: the field itself, or the button beside the text box with
  // `editable`.
  private get _triggerEl() {
    return this.renderRoot.querySelector<HTMLElement>(
      this.editable ? '.date-picker__toggle' : '.date-picker__control'
    );
  }

  // The element the browser points at when it reports the field invalid.
  private get _validityAnchor() {
    const atFault = this.error ? this._invalidFields : null;
    const selector = !this.editable
      ? '.date-picker__control'
      : atFault?.end && !atFault.start
        ? '.date-picker__input--end'
        : '.date-picker__input';
    return this.renderRoot.querySelector<HTMLElement>(selector) ?? undefined;
  }

  get _firstDay() {
    const n = Math.trunc(Number(this.firstDayOfWeek));
    return n >= 0 && n <= 6 ? n : 0;
  }

  private _keepActiveInView() {
    const first = this._viewMonth;
    const last = addMonths(first, this._monthCount - 1);
    if (this._activeDate < first) {
      this._viewMonth = startOfMonth(this._activeDate);
    } else if (this._activeDate > endOfMonth(last)) {
      this._viewMonth = startOfMonth(
        addMonths(this._activeDate, 1 - this._monthCount)
      );
    }
  }

  // A render formats every day on screen — up to 84 with a range — and the
  // pointer re-renders on each day it crosses while a range is picked, so the
  // formatters are built once per locale and options.
  private _formatters = new Map<string, Intl.DateTimeFormat>();

  private _formatter(options: Intl.DateTimeFormatOptions) {
    const key = `${this.locale}|${JSON.stringify(options)}`;
    let formatter = this._formatters.get(key);
    if (!formatter) {
      try {
        formatter = new Intl.DateTimeFormat(this.locale || undefined, options);
      } catch {
        // An unknown locale tag throws; fall back to the user agent's.
        formatter = new Intl.DateTimeFormat(undefined, options);
      }
      this._formatters.set(key, formatter);
    }
    return formatter;
  }

  private _format(date: Date, options: Intl.DateTimeFormatOptions) {
    return this._formatter(options).format(date);
  }

  get _mask(): MaskSegment[] {
    const mask = dateMask(
      this._formatter({
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        numberingSystem: 'latn',
      })
    );
    return this.range && !this._split ? rangeMask(mask) : mask;
  }

  get _formatText() {
    return this.formatText || maskPattern(this._mask);
  }

  private _maskText({ start, end }: DateRange) {
    const mask = this._mask;
    return applyMask(
      maskDigits(this.range ? [start, end] : [start], mask),
      mask
    );
  }

  // One end of a range in its own text box.
  private _fieldText(date: Date) {
    const mask = this._mask;
    return applyMask(maskDigits([date], mask), mask);
  }

  private _readField(text: string): Date | null {
    const mask = this._mask;
    const digits = text.replace(/\D/g, '');
    if (digits.length !== maskCapacity(mask)) return null;
    return readMask(digits, mask)?.[0] ?? null;
  }

  private _formatValue({ start, end }: DateRange) {
    const formatter = this._formatter({
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (!this.range) return formatter.format(start);
    // `formatRange` drops what the two ends share: "Jan 16 – 21, 2026".
    return typeof formatter.formatRange === 'function'
      ? formatter.formatRange(start, end)
      : `${formatter.format(start)} – ${formatter.format(end)}`;
  }

  private _syncFormValue() {
    const selection = this._selection;
    this._internals.setFormValue(
      selection
        ? this.range
          ? toISORange(selection)
          : toISODate(selection.start)
        : null
    );
    const invalidity = this._invalidity;
    if (invalidity) {
      this._internals.setValidity(
        invalidity.flags,
        invalidity.message,
        this._validityAnchor
      );
    } else {
      this._internals.setValidity({});
    }
  }

  private _handleInvalid = () => {
    this.error = true;
  };

  private _handleDocumentClick = (e: MouseEvent) => {
    if (this.open && !e.composedPath().includes(this)) {
      this.open = false;
    }
  };

  private _openCalendar() {
    this._opener = (this.renderRoot as ShadowRoot)
      .activeElement as HTMLElement | null;
    this._focusActiveDay = true;
    this.open = true;
  }

  private _close({ restoreFocus = true } = {}) {
    this.open = false;
    const opener = this._opener;
    this._opener = null;
    if (restoreFocus) {
      (opener?.isConnected ? opener : this._triggerEl)?.focus();
    }
  }

  private _handleTriggerClick() {
    if (this.disabled) return;
    if (this.open) {
      this.open = false;
    } else {
      this._openCalendar();
    }
  }

  private _handleTriggerKeydown(e: KeyboardEvent) {
    if (this.disabled) return;
    if (e.key === 'Escape' && this.open) {
      e.preventDefault();
      e.stopPropagation();
      this.open = false;
      return;
    }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !this.open) {
      e.preventDefault();
      this._openCalendar();
    }
  }

  // Only digits are typed; the mask writes the marks between them. A pasted
  // ISO date, like `2026-01-16`, is read as one.
  private _handleInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    const raw = input.value;
    const mask = this._mask;
    const capacity = maskCapacity(mask);
    const pasted = this.range ? parseISORange(raw) : parseISODate(raw);
    const digits = pasted
      ? maskDigits(
          'start' in pasted ? [pasted.start, pasted.end] : [pasted],
          mask
        )
      : raw.replace(/\D/g, '').slice(0, capacity);
    const digitsBeforeCaret = pasted
      ? digits.length
      : raw.slice(0, input.selectionStart ?? raw.length).replace(/\D/g, '')
          .length;

    const text = applyMask(digits, mask);
    input.value = text;
    const caret = caretAfterDigits(text, digitsBeforeCaret);
    input.setSelectionRange(caret, caret);
    this._text = text;

    const dates = digits.length === capacity ? readMask(digits, mask) : null;
    let value = '';
    if (dates && !this.range) {
      value = toISODate(dates[0]);
    } else if (dates && dates[0] <= dates[1]) {
      value = toISORange({ start: dates[0], end: dates[1] });
    }
    this._setTypedValue(value);
  }

  // With two text boxes, each takes one date. A range pasted into either, like
  // `2026-01-16/2026-01-21`, fills both.
  private _handleFieldInput(e: InputEvent, end: boolean) {
    const input = e.target as HTMLInputElement;
    const raw = input.value;
    const pastedRange = parseISORange(raw);
    if (pastedRange) {
      this._startText = this._fieldText(pastedRange.start);
      this._endText = this._fieldText(pastedRange.end);
      input.value = end ? this._endText : this._startText;
    } else {
      const mask = this._mask;
      const pasted = parseISODate(raw);
      const digits = pasted
        ? maskDigits([pasted], mask)
        : raw.replace(/\D/g, '').slice(0, maskCapacity(mask));
      const digitsBeforeCaret = pasted
        ? digits.length
        : raw.slice(0, input.selectionStart ?? raw.length).replace(/\D/g, '')
            .length;
      const text = applyMask(digits, mask);
      input.value = text;
      const caret = caretAfterDigits(text, digitsBeforeCaret);
      input.setSelectionRange(caret, caret);
      if (end) this._endText = text;
      else this._startText = text;
    }
    const start = this._readField(this._startText);
    const last = this._readField(this._endText);
    this._setTypedValue(
      start && last && start <= last ? toISORange({ start, end: last }) : ''
    );
  }

  private _setTypedValue(value: string) {
    if (value === this.value) return;
    this._typing = true;
    this.value = value;
    if (value) this.error = false;
    const range = value && this.range ? parseISORange(value) : null;
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: range
          ? { value, start: toISODate(range.start), end: toISODate(range.end) }
          : { value },
      })
    );
  }

  // The arrows move the caret in a text box, so it opens the calendar with
  // Alt+↓, like a native select.
  private _handleInputKeydown(e: KeyboardEvent) {
    if (this.disabled) return;
    if (e.key === 'Escape' && this.open) {
      e.preventDefault();
      e.stopPropagation();
      this.open = false;
      return;
    }
    if (e.key === 'ArrowDown' && e.altKey && !this.open) {
      e.preventDefault();
      this._openCalendar();
    }
  }

  // Tabbing past the last control in the calendar leaves the component, and
  // the calendar goes with it. A click elsewhere has no related target and is
  // left to the document listener.
  private _handleFocusOut(e: FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (
      this.open &&
      next &&
      !this.renderRoot.contains(next) &&
      !this.contains(next)
    ) {
      this.open = false;
    }
  }

  private _handlePopoverKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      // A date picker inside a modal closes itself, not the modal.
      e.stopPropagation();
      this._close();
    }
  }

  private _canShowMonth(month: Date) {
    const min = this._minDate;
    const max = this._maxDate;
    return !(
      (min && endOfMonth(month) < min) ||
      (max && startOfMonth(month) > max)
    );
  }

  // The month a step would bring on screen: the one before the first, or the
  // one after the last.
  private _revealedMonth(delta: number) {
    return addMonths(this._viewMonth, delta < 0 ? delta : this._monthCount);
  }

  private _shiftMonth(delta: number) {
    if (!this._canShowMonth(this._revealedMonth(delta))) return;
    this._viewMonth = addMonths(this._viewMonth, delta);
    this._activeDate = clampDate(
      addMonths(this._activeDate, delta),
      this._minDate,
      this._maxDate
    );
  }

  private _handleGridKeydown(e: KeyboardEvent) {
    const current = this._activeDate;
    const weekStart = startOfWeek(current, this._firstDay);
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(current, -1),
      ArrowRight: () => addDays(current, 1),
      ArrowUp: () => addDays(current, -7),
      ArrowDown: () => addDays(current, 7),
      Home: () => weekStart,
      End: () => addDays(weekStart, 6),
      PageUp: () => addMonths(current, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(current, e.shiftKey ? 12 : 1),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    this._activeDate = clampDate(move(), this._minDate, this._maxDate);
    if (this._anchor) this._preview = this._activeDate;
    this._focusActiveDay = true;
  }

  // Out of `min`/`max`, or named by `isDateDisabled` — a holiday, say. Either
  // way the day can't be picked.
  private _isPickable(date: Date) {
    return (
      !isOutOfRange(date, this._minDate, this._maxDate) &&
      !this.isDateDisabled?.(date)
    );
  }

  private _handleDayHover(date: Date) {
    if (this._anchor && this._isPickable(date)) {
      this._preview = date;
    }
  }

  private _pick(date: Date) {
    if (!this._isPickable(date)) return;
    this._activeDate = date;

    if (!this.range) {
      this._commit(toISODate(date), {});
      return;
    }
    if (!this._anchor) {
      this._anchor = date;
      this._preview = date;
      return;
    }
    const [start, end] =
      date < this._anchor ? [date, this._anchor] : [this._anchor, date];
    this._commit(toISORange({ start, end }), {
      start: toISODate(start),
      end: toISODate(end),
    });
  }

  private _commit(value: string, extra: Record<string, string>) {
    this.value = value;
    this.error = false;
    this._close();
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value, ...extra },
      })
    );
  }

  // The range on display: the one being picked while it has an anchor, the
  // committed one otherwise.
  private get _highlight(): DateRange | null {
    if (this._anchor) {
      const other = this._preview ?? this._anchor;
      return other < this._anchor
        ? { start: other, end: this._anchor }
        : { start: this._anchor, end: other };
    }
    return this._selection;
  }

  private _renderMonth(month: Date, index: number, weekCount: number) {
    const active = this._activeDate;
    const highlight = this._highlight;
    const min = this._minDate;
    const max = this._maxDate;
    const now = today();
    const titleId = `${this._baseId}-title-${index}`;
    const isFirst = index === 0;
    const isLast = index === this._monthCount - 1;
    const weekdays = Array.from({ length: 7 }, (_, i) =>
      addDays(REFERENCE_SUNDAY, (this._firstDay + i) % 7)
    );
    const spacer = html`<span
      class="date-picker-calendar__nav-spacer"
      aria-hidden="true"
    ></span>`;

    return html`
      <div class="date-picker-calendar__month">
        <div class="date-picker-calendar__header">
          ${isFirst
            ? html`<button
                type="button"
                class="date-picker-calendar__nav date-picker-calendar__nav--previous"
                aria-label="${this.previousMonthLabel}"
                aria-disabled="${ifDefined(
                  this._canShowMonth(this._revealedMonth(-1))
                    ? undefined
                    : 'true'
                )}"
                @click="${() => this._shiftMonth(-1)}"
              >
                ${ICON_CHEVRON_LEFT}
              </button>`
            : spacer}
          <div id="${titleId}" class="date-picker-calendar__title">
            ${this._format(month, { month: 'long', year: 'numeric' })}
          </div>
          ${isLast
            ? html`<button
                type="button"
                class="date-picker-calendar__nav date-picker-calendar__nav--next"
                aria-label="${this.nextMonthLabel}"
                aria-disabled="${ifDefined(
                  this._canShowMonth(this._revealedMonth(1))
                    ? undefined
                    : 'true'
                )}"
                @click="${() => this._shiftMonth(1)}"
              >
                ${ICON_CHEVRON_RIGHT}
              </button>`
            : spacer}
        </div>
        <table
          class="date-picker-calendar__grid"
          role="grid"
          aria-labelledby="${titleId}"
          @keydown="${this._handleGridKeydown}"
        >
          <thead>
            <tr>
              ${weekdays.map(
                // Each language has its own narrow form: "S" in English, "D"
                // in Portuguese, "日" in Chinese. Cutting the short form
                // repeats letters instead, like "se" for segunda and sexta.
                (day) => html`
                  <th class="date-picker-calendar__weekday" scope="col">
                    <span aria-hidden="true"
                      >${this._format(day, { weekday: 'narrow' })}</span
                    >
                    <span class="date-picker-calendar__sr-only"
                      >${this._format(day, { weekday: 'long' })}</span
                    >
                  </th>
                `
              )}
            </tr>
          </thead>
          <tbody>
            ${monthWeeks(month, this._firstDay, weekCount).map(
              (week) => html`
                <tr>
                  ${week.map((day, column) => {
                    // Days of the neighbouring months only fill the week, so
                    // the cell stays empty: no number, nothing to click and
                    // nothing for a screen reader to list.
                    if (!isSameMonth(day, month)) {
                      return html`<td class="date-picker-calendar__cell"></td>`;
                    }
                    const isHighlighted = (date: Date | undefined) =>
                      !!date &&
                      !!highlight &&
                      isSameMonth(date, month) &&
                      date >= highlight.start &&
                      date <= highlight.end;
                    const isEdge =
                      isHighlighted(day) &&
                      (isSameDay(day, highlight!.start) ||
                        isSameDay(day, highlight!.end));
                    const isBetween = isHighlighted(day) && !isEdge;
                    // A highlighted day squares the corners it shares with a
                    // highlighted neighbour in the same row, so a range reads
                    // as one band broken only at the row ends.
                    const joinsStart =
                      isHighlighted(day) && isHighlighted(week[column - 1]);
                    const joinsEnd =
                      isHighlighted(day) && isHighlighted(week[column + 1]);
                    const isToday = isSameDay(day, now);
                    const isUnavailable = !!this.isDateDisabled?.(day);
                    const classes = [
                      'date-picker-calendar__day',
                      isToday ? 'date-picker-calendar__day--today' : '',
                      isBetween ? 'date-picker-calendar__day--in-range' : '',
                      isEdge ? 'date-picker-calendar__day--selected' : '',
                      joinsStart ? 'date-picker-calendar__day--join-start' : '',
                      joinsEnd ? 'date-picker-calendar__day--join-end' : '',
                      // Opacity alone repeats the adjacent-month cue; the
                      // strikethrough says "unavailable" on its own.
                      isUnavailable
                        ? 'date-picker-calendar__day--unavailable'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ');
                    // The button is the gridcell, so the focused element carries
                    // aria-selected and a screen reader reads it with the day.
                    return html`
                      <td
                        class="date-picker-calendar__cell"
                        role="presentation"
                      >
                        <button
                          type="button"
                          role="gridcell"
                          aria-selected="${isEdge || isBetween
                            ? 'true'
                            : 'false'}"
                          class="${classes}"
                          data-date="${toISODate(day)}"
                          tabindex="${isSameDay(day, active) ? 0 : -1}"
                          aria-label="${this._format(day, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}"
                          aria-current="${ifDefined(
                            isToday ? 'date' : undefined
                          )}"
                          aria-disabled="${ifDefined(
                            isOutOfRange(day, min, max) || isUnavailable
                              ? 'true'
                              : undefined
                          )}"
                          @click="${() => this._pick(day)}"
                          @mouseenter="${() => this._handleDayHover(day)}"
                        >
                          ${day.getDate()}
                        </button>
                      </td>
                    `;
                  })}
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  // One live region for the months on screen, so paging a range announces
  // "January – February 2026" once instead of two titles one after the other.
  private _formatViewMonths(months: Date[]) {
    const formatter = this._formatter({ month: 'long', year: 'numeric' });
    const first = months[0];
    const last = months[months.length - 1];
    if (first === last) return formatter.format(first);
    return typeof formatter.formatRange === 'function'
      ? formatter.formatRange(first, last)
      : `${formatter.format(first)} – ${formatter.format(last)}`;
  }

  private _renderCalendar() {
    const months = Array.from({ length: this._monthCount }, (_, i) =>
      addMonths(this._viewMonth, i)
    );
    const weekCount = Math.max(
      ...months.map((month) => monthWeeks(month, this._firstDay).length)
    );

    // A range is picked in two steps, and the first leaves nothing a screen
    // reader would read on its own, so a second region announces it. It
    // changes only when the start is picked, never with the months, so the
    // two regions do not speak over each other. The second step needs no
    // region: the calendar closes and the focus lands on the field, named with
    // the period it now holds, ends in order.
    return html`
      <div
        id="${this._baseId}-dialog"
        class="date-picker__popover"
        role="dialog"
        aria-modal="false"
        aria-label="${this.dialogLabel}"
        @keydown="${this._handlePopoverKeydown}"
      >
        <div class="date-picker-calendar">
          ${months.map((month, i) => this._renderMonth(month, i, weekCount))}
        </div>
        <div
          class="date-picker-calendar__sr-only date-picker-calendar__months-status"
          aria-live="polite"
        >
          ${this._formatViewMonths(months)}
        </div>
        <div
          class="date-picker-calendar__sr-only date-picker-calendar__range-status"
          aria-live="polite"
        >
          ${this.range && this._anchor ? this.rangeStartText : ''}
        </div>
      </div>
    `;
  }

  private _renderButtonControl() {
    const selection = this._selection;
    const labelId = `${this._baseId}-label`;
    const valueId = `${this._baseId}-value`;
    const requiredId = `${this._baseId}-required`;
    const message = this._message;
    // Read before the message, so "Required" comes first and an error that
    // repeats it stays second.
    const describedBy = [
      this.required ? requiredId : '',
      message ? `${this._baseId}-message` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <button
        id="${this._baseId}-control"
        type="button"
        class="date-picker__control"
        aria-haspopup="dialog"
        aria-expanded="${this.open ? 'true' : 'false'}"
        aria-controls="${ifDefined(
          this.open ? `${this._baseId}-dialog` : undefined
        )}"
        aria-label="${ifDefined(this.ariaLabel || undefined)}"
        aria-labelledby="${ifDefined(
          this.ariaLabel
            ? undefined
            : this.label
              ? `${labelId} ${valueId}`
              : valueId
        )}"
        aria-describedby="${ifDefined(describedBy || undefined)}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        ?disabled="${this.disabled}"
        @click="${this._handleTriggerClick}"
        @keydown="${this._handleTriggerKeydown}"
      >
        <span id="${valueId}" class="date-picker__value">
          ${selection
            ? this._formatValue(selection)
            : this.placeholder || 'Select a date'}
        </span>
        <span class="date-picker__icon">${ICON_CALENDAR}</span>
      </button>
      ${this.required
        ? html`<span id="${requiredId}" class="date-picker__sr-only"
            >${this.requiredText || DEFAULTS.requiredText}</span
          >`
        : nothing}
    `;
  }

  // With `editable`, a text box takes the date in the locale's numeric form,
  // and a button beside it opens the calendar.
  private _renderTextControl() {
    const message = this._message;
    const formatId = `${this._baseId}-format`;
    // The format is part of the description, not only the placeholder: the
    // placeholder is gone once typing starts, and an author may replace it.
    // When the message below the field already shows it, it is read once.
    const describedBy = [
      this._showsFormat ? '' : formatId,
      message ? `${this._baseId}-message` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <span id="${formatId}" class="date-picker__sr-only"
        >${this._formatText}</span
      >
      <div class="date-picker__control">
        <input
          id="${this._baseId}-control"
          class="date-picker__input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          .value="${live(this._text)}"
          placeholder="${this.placeholder || this._formatText}"
          aria-label="${ifDefined(this.ariaLabel || undefined)}"
          aria-describedby="${describedBy}"
          aria-invalid="${this.error ? 'true' : 'false'}"
          aria-required="${this.required ? 'true' : 'false'}"
          ?disabled="${this.disabled}"
          @input="${this._handleInput}"
          @keydown="${this._handleInputKeydown}"
        />
        ${this._renderToggle()}
      </div>
    `;
  }

  // The button beside the text boxes that opens the calendar.
  private _renderToggle() {
    const selection = this._selection;
    return html`
      <button
        type="button"
        class="date-picker__toggle"
        aria-label="${selection
          ? `${this.dialogLabel}, ${this._formatValue(selection)}`
          : this.dialogLabel}"
        aria-haspopup="dialog"
        aria-expanded="${this.open ? 'true' : 'false'}"
        aria-controls="${ifDefined(
          this.open ? `${this._baseId}-dialog` : undefined
        )}"
        ?disabled="${this.disabled}"
        @click="${this._handleTriggerClick}"
        @keydown="${this._handleTriggerKeydown}"
      >
        <span class="date-picker__icon">${ICON_CALENDAR}</span>
      </button>
    `;
  }

  // With `range-fields="two"`, one control holds a text box per end. The
  // group carries the field's name; each box is named by its end, so a screen
  // reader says which date is being typed. The dash between them is drawn
  // only.
  private _renderSplitControl() {
    const message = this._message;
    const formatId = `${this._baseId}-format`;
    const labelId = `${this._baseId}-label`;
    const invalid = this._invalidFields;
    // An error message describes only the boxes it is about; a hint or the
    // format describes both.
    const describedBy = (end: boolean) =>
      [
        this._showsFormat ? '' : formatId,
        message && (!this.error || (end ? invalid.end : invalid.start))
          ? `${this._baseId}-message`
          : '',
      ]
        .filter(Boolean)
        .join(' ');
    const field = (end: boolean) => html`
      <input
        id="${this._baseId}-${end ? 'end' : 'control'}"
        class="date-picker__input date-picker__input--${end ? 'end' : 'start'}"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        .value="${live(end ? this._endText : this._startText)}"
        placeholder="${this.placeholder || this._formatText}"
        aria-label="${end
          ? this.endLabel || DEFAULTS.endLabel
          : this.startLabel || DEFAULTS.startLabel}"
        aria-describedby="${describedBy(end)}"
        aria-invalid="${(end ? invalid.end : invalid.start) ? 'true' : 'false'}"
        aria-required="${this.required ? 'true' : 'false'}"
        ?disabled="${this.disabled}"
        @input="${(e: InputEvent) => this._handleFieldInput(e, end)}"
        @keydown="${this._handleInputKeydown}"
      />
    `;

    return html`
      <span id="${formatId}" class="date-picker__sr-only"
        >${this._formatText}</span
      >
      <div
        class="date-picker__control date-picker__control--split"
        role="group"
        aria-label="${ifDefined(this.ariaLabel || undefined)}"
        aria-labelledby="${ifDefined(
          !this.ariaLabel && this.label ? labelId : undefined
        )}"
      >
        ${field(false)}
        <span class="date-picker__separator" aria-hidden="true">–</span>
        ${field(true)} ${this._renderToggle()}
      </div>
    `;
  }

  // With `editable` and no hint, the format takes the hint's place, so it stays
  // on screen once the placeholder is gone.
  get _showsFormat() {
    return this.editable && !this.error && !this.hint;
  }

  get _message() {
    if (this.error) return this._invalidity?.message ?? this.errorText;
    return this._showsFormat ? this._formatText : this.hint;
  }

  render() {
    const selection = this._selection;
    const message = this._message;
    const labelId = `${this._baseId}-label`;
    const forceStateClass =
      this.forceState === 'focused' || this.open
        ? ' date-picker--force-focus'
        : this.forceState === 'hovered'
          ? ' date-picker--force-hover'
          : '';

    return html`
      <div
        class="date-picker date-picker--${this._size}${this.disabled
          ? ' date-picker--disabled'
          : ''}${this.error ? ' date-picker--error' : ''}${selection
          ? ''
          : ' date-picker--placeholder'}${forceStateClass}"
        @focusout="${this._handleFocusOut}"
      >
        ${this.label
          ? html`
              <div class="date-picker__head">
                <div class="date-picker__label-wrap">
                  <label id="${labelId}" for="${this._baseId}-control"
                    >${this.label}</label
                  >
                  ${this.optional
                    ? html`<span class="date-picker__optional"
                        >${this.optionalText}</span
                      >`
                    : nothing}
                </div>
              </div>
            `
          : nothing}

        <div class="date-picker__anchor">
          ${this._split
            ? this._renderSplitControl()
            : this.editable
              ? this._renderTextControl()
              : this._renderButtonControl()}
          ${this.open ? this._renderCalendar() : nothing}
        </div>

        ${message
          ? html`<p id="${this._baseId}-message" class="date-picker__message">
              ${message}
            </p>`
          : nothing}
      </div>
    `;
  }
}
