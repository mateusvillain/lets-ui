import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './progress-bar.scss?inline';

const VARIANTS = ['primary', 'success', 'caution', 'danger'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const PLACEMENTS = ['top', 'inline'] as const;

type Variant = (typeof VARIANTS)[number];
type Size = (typeof SIZES)[number];
type Placement = (typeof PLACEMENTS)[number];

// What the bar is called when it has no label of its own. In English, like the
// Status's; `label` replaces it.
const DEFAULT_LABEL = 'Progress bar';

function pick<T extends string>(
  options: readonly T[],
  value: string | null,
  fallback: T
): T {
  const next = (value ?? '').trim().toLowerCase();
  return (options as readonly string[]).includes(next) ? (next as T) : fallback;
}

export class LuiProgressBar extends LitElement {
  static styles = unsafeCSS(styles);

  // A missing or removed `value` makes the bar indeterminate, so null is a state
  // rather than a missing default.
  @property({ type: Number }) value: number | null = null;
  @property({ type: Number }) max = 100;
  @property() variant = 'primary';
  @property() size = 'md';
  @property({ attribute: 'label-placement' }) labelPlacement = 'top';
  @property() label = '';
  // The value in its own unit, such as "3.2 GB of 10 GB" or "3 of 4 steps".
  // Replaces the percentage on screen and becomes aria-valuetext, so assistive
  // technology reads the same words instead of a computed percentage.
  @property({ attribute: 'value-text' }) valueText = '';
  @property() caption = '';
  @property({ type: Boolean, attribute: 'hide-label' }) hideLabel = false;
  @property({ type: Boolean, attribute: 'hide-value' }) hideValue = false;

  private get _max(): number {
    return Number.isFinite(this.max) && this.max > 0 ? this.max : 100;
  }

  // The value clamped into [0, max], or null while the duration is unknown.
  private get _value(): number | null {
    if (this.value === null || !Number.isFinite(this.value)) return null;
    return Math.min(Math.max(this.value, 0), this._max);
  }

  render() {
    const variant = pick<Variant>(VARIANTS, this.variant, 'primary');
    const size = pick<Size>(SIZES, this.size, 'md');
    const placement = pick<Placement>(PLACEMENTS, this.labelPlacement, 'top');
    const value = this._value;
    const max = this._max;
    const indeterminate = value === null;
    const fraction = indeterminate ? 0 : (value / max) * 100;
    // Rounded down, so the text says 100% only when the task is done. The
    // epsilon absorbs float error such as 29 / 100 * 100 = 28.999…
    const percent = Math.floor(fraction + 1e-9);

    const ownLabel = (this.label ?? '').trim();
    const caption = (this.caption ?? '').trim();
    const valueText = indeterminate ? '' : (this.valueText ?? '').trim();
    const showLabel = ownLabel && !this.hideLabel;
    const showValue = !indeterminate && !this.hideValue;

    const classes = [
      'progress-bar',
      `progress-bar--${variant}`,
      `progress-bar--${size}`,
      placement === 'inline' && 'progress-bar--inline',
      indeterminate && 'progress-bar--indeterminate',
    ]
      .filter(Boolean)
      .join(' ');

    // The visible label names the bar through aria-labelledby. When there is
    // no label, or it is hidden, the name moves to aria-label, so the bar
    // always has a name. The visible value repeats aria-valuenow, or
    // aria-valuetext when it has a unit of its own, so it stays out of the
    // accessibility tree. The caption describes the bar and is a polite live
    // region, because screen readers do not reliably announce a change in
    // aria-valuenow. It is always rendered: a live region inserted together
    // with its text is often not announced.
    return html`
      <div class="${classes}">
        ${showLabel
          ? html`<span class="progress-bar__label" id="label"
              >${ownLabel}</span
            >`
          : nothing}
        ${showValue
          ? html`<span class="progress-bar__value" aria-hidden="true"
              >${valueText || `${percent}%`}</span
            >`
          : nothing}
        <div
          class="progress-bar__track"
          role="progressbar"
          aria-labelledby="${showLabel ? 'label' : nothing}"
          aria-label="${showLabel ? nothing : ownLabel || DEFAULT_LABEL}"
          aria-describedby="${caption ? 'caption' : nothing}"
          aria-valuemin="0"
          aria-valuemax="${max}"
          aria-valuenow="${indeterminate ? nothing : value}"
          aria-valuetext="${valueText || nothing}"
        >
          <span
            class="progress-bar__indicator"
            style="${indeterminate
              ? ''
              : `--lui-progress-bar-value: ${fraction}%`}"
          ></span>
        </div>
        <span class="progress-bar__caption" id="caption" aria-live="polite"
          >${caption || nothing}</span
        >
      </div>
    `;
  }
}
