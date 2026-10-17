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
  @property({ type: Boolean, reflect: true }) editable = false;
  @property() placeholder = '';
  @property() size = 'lg';
  @property() locale = 'en-US';
  @property({ type: Number, attribute: 'first-day-of-week' })
  firstDayOfWeek = 0;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) optional = false;
  @property({ attribute: 'optional-text' }) optionalText = '(optional)';
  @property() hint = '';
  @property({ type: Boolean }) error = false;
  @property({ attribute: 'error-text' }) errorText = 'This field is required.';
  @property({ attribute: 'bad-input-text' }) badInputText =
    'Enter a valid date.';
  @property({ attribute: 'dialog-label' }) dialogLabel = 'Choose date';
  @property({ attribute: 'previous-month-label' }) previousMonthLabel =
    'Previous month';
  @property({ attribute: 'next-month-label' }) nextMonthLabel = 'Next month';
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

  private _baseId: string;
  // Set by user interaction only, so an `open` attribute in the markup shows
  // the calendar without pulling focus into it on page load.
  private _focusActiveDay = false;
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
      (changed.has('value') || changed.has('locale') || changed.has('range')) &&
      !this._typing
    ) {
      const selection = this._selection;
      this._text = selection ? this._maskText(selection) : '';
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
    if (changed.has('open')) {
      this._anchor = null;
      this._preview = null;
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
    if (
      changed.has('value') ||
      changed.has('range') ||
      changed.has('min') ||
      changed.has('max') ||
      changed.has('editable') ||
      changed.has('_text')
    ) {
      this._syncFormValue();
    }
    if (this._focusActiveDay && this.open) {
      this._focusActiveDay = false;
      this.renderRoot
        .querySelector<HTMLElement>('.calendar__day[tabindex="0"]')
        ?.focus();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.value = '';
    this._text = '';
    this.error = false;
    this.open = false;
  }

  get _size(): 'lg' | 'md' {
    return this.size === 'md' ? 'md' : 'lg';
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
    return this.editable && this._text.trim() !== '' && !this._selection;
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
    return (
      this.renderRoot.querySelector<HTMLElement>(
        this.editable ? '.date-picker__input' : '.date-picker__control'
      ) ?? undefined
    );
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

  private _formatter(options: Intl.DateTimeFormatOptions) {
    try {
      return new Intl.DateTimeFormat(this.locale || undefined, options);
    } catch {
      // An unknown locale tag throws; fall back to the user agent's.
      return new Intl.DateTimeFormat(undefined, options);
    }
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
    return this.range ? rangeMask(mask) : mask;
  }

  private _maskText({ start, end }: DateRange) {
    const mask = this._mask;
    return applyMask(
      maskDigits(this.range ? [start, end] : [start], mask),
      mask
    );
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
    const min = this._minDate;
    const max = this._maxDate;
    const anchor = this._validityAnchor;
    if (this._badInput) {
      this._internals.setValidity(
        { badInput: true },
        this.badInputText,
        anchor
      );
    } else if (this.required && !selection) {
      this._internals.setValidity(
        { valueMissing: true },
        this.errorText,
        anchor
      );
    } else if (selection && min && selection.start < min) {
      this._internals.setValidity(
        { rangeUnderflow: true },
        this.errorText,
        anchor
      );
    } else if (selection && max && selection.end > max) {
      this._internals.setValidity(
        { rangeOverflow: true },
        this.errorText,
        anchor
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
    this._focusActiveDay = true;
    this.open = true;
  }

  private _close({ restoreFocus = true } = {}) {
    this.open = false;
    if (restoreFocus) this._triggerEl?.focus();
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

  private _handleDayHover(date: Date) {
    if (this._anchor && !isOutOfRange(date, this._minDate, this._maxDate)) {
      this._preview = date;
    }
  }

  private _pick(date: Date) {
    if (isOutOfRange(date, this._minDate, this._maxDate)) return;
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
      class="calendar__nav-spacer"
      aria-hidden="true"
    ></span>`;

    return html`
      <div class="calendar__month">
        <div class="calendar__header">
          ${isFirst
            ? html`<button
                type="button"
                class="calendar__nav calendar__nav--previous"
                aria-label="${this.previousMonthLabel}"
                aria-disabled="${this._canShowMonth(this._revealedMonth(-1))
                  ? 'false'
                  : 'true'}"
                @click="${() => this._shiftMonth(-1)}"
              >
                ${ICON_CHEVRON_LEFT}
              </button>`
            : spacer}
          <div id="${titleId}" class="calendar__title" aria-live="polite">
            ${this._format(month, { month: 'long', year: 'numeric' })}
          </div>
          ${isLast
            ? html`<button
                type="button"
                class="calendar__nav calendar__nav--next"
                aria-label="${this.nextMonthLabel}"
                aria-disabled="${this._canShowMonth(this._revealedMonth(1))
                  ? 'false'
                  : 'true'}"
                @click="${() => this._shiftMonth(1)}"
              >
                ${ICON_CHEVRON_RIGHT}
              </button>`
            : spacer}
        </div>
        <table
          class="calendar__grid"
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
                  <th class="calendar__weekday" scope="col">
                    <span aria-hidden="true"
                      >${this._format(day, { weekday: 'narrow' })}</span
                    >
                    <span class="calendar__sr-only"
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
                    const inMonth = isSameMonth(day, month);
                    // Side by side, a day can show up in two grids. Only the
                    // copy in its own month is highlighted and focusable.
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
                    const classes = [
                      'calendar__day',
                      inMonth ? '' : 'calendar__day--outside',
                      isToday ? 'calendar__day--today' : '',
                      isBetween ? 'calendar__day--in-range' : '',
                      isEdge ? 'calendar__day--selected' : '',
                      joinsStart ? 'calendar__day--join-start' : '',
                      joinsEnd ? 'calendar__day--join-end' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return html`
                      <td
                        class="calendar__cell"
                        aria-selected="${isEdge || isBetween
                          ? 'true'
                          : 'false'}"
                      >
                        <button
                          type="button"
                          class="${classes}"
                          data-date="${toISODate(day)}"
                          tabindex="${inMonth && isSameDay(day, active)
                            ? 0
                            : -1}"
                          aria-label="${this._format(day, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}"
                          aria-current="${ifDefined(
                            isToday ? 'date' : undefined
                          )}"
                          aria-disabled="${isOutOfRange(day, min, max)
                            ? 'true'
                            : 'false'}"
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

  private _renderCalendar() {
    const months = Array.from({ length: this._monthCount }, (_, i) =>
      addMonths(this._viewMonth, i)
    );
    const weekCount = Math.max(
      ...months.map((month) => monthWeeks(month, this._firstDay).length)
    );

    return html`
      <div
        id="${this._baseId}-dialog"
        class="date-picker__popover"
        role="dialog"
        aria-modal="false"
        aria-label="${this.dialogLabel}"
        @keydown="${this._handlePopoverKeydown}"
      >
        <div class="calendar">
          ${months.map((month, i) => this._renderMonth(month, i, weekCount))}
        </div>
      </div>
    `;
  }

  private _renderButtonControl() {
    const selection = this._selection;
    const labelId = `${this._baseId}-label`;
    const valueId = `${this._baseId}-value`;
    const message = this._message;

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
        aria-describedby="${ifDefined(
          message ? `${this._baseId}-message` : undefined
        )}"
        aria-invalid="${this.error ? 'true' : 'false'}"
        aria-required="${this.required ? 'true' : 'false'}"
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
    `;
  }

  // With `editable`, a text box takes the date in the locale's numeric form,
  // and a button beside it opens the calendar.
  private _renderTextControl() {
    const message = this._message;

    return html`
      <div class="date-picker__control">
        <input
          id="${this._baseId}-control"
          class="date-picker__input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          .value="${live(this._text)}"
          placeholder="${this.placeholder || maskPattern(this._mask)}"
          aria-label="${ifDefined(this.ariaLabel || undefined)}"
          aria-describedby="${ifDefined(
            message ? `${this._baseId}-message` : undefined
          )}"
          aria-invalid="${this.error ? 'true' : 'false'}"
          aria-required="${this.required ? 'true' : 'false'}"
          ?disabled="${this.disabled}"
          @input="${this._handleInput}"
          @keydown="${this._handleInputKeydown}"
        />
        <button
          type="button"
          class="date-picker__toggle"
          aria-label="${this.dialogLabel}"
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
      </div>
    `;
  }

  get _message() {
    if (!this.error) return this.hint;
    return this._badInput ? this.badInputText : this.errorText;
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
          ${this.editable
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
