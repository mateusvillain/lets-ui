import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './status.scss?inline';

const FEEDBACK = ['success', 'caution', 'danger', 'info'] as const;
const SOCIAL = ['online', 'away', 'busy', 'offline'] as const;
const SIZES = ['md', 'lg'] as const;

type Variant = (typeof FEEDBACK)[number] | (typeof SOCIAL)[number];

// What a status says when it has no label of its own. In English, like the
// Avatar's; `label` replaces it.
const LABELS: Record<Variant, string> = {
  success: 'Success',
  caution: 'Caution',
  danger: 'Danger',
  info: 'Info',
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

// The feedback icons, on a 20px grid. They paint with `currentColor`, which the
// stylesheet sets to the variant's icon colour.
const ICONS: Record<(typeof FEEDBACK)[number], string> = {
  success:
    'M1.25 10C1.25 7.58333 2.10417 5.52083 3.8125 3.8125C5.52083 2.10417 7.58333 1.25 10 1.25C12.4167 1.25 14.4792 2.10417 16.1875 3.8125C17.8958 5.52083 18.75 7.58333 18.75 10C18.75 12.4167 17.8958 14.4792 16.1875 16.1875C14.4792 17.8958 12.4167 18.75 10 18.75C7.58333 18.75 5.52083 17.8958 3.8125 16.1875C2.10417 14.4792 1.25 12.4167 1.25 10ZM6.69375 9.55625C6.56875 9.43542 6.42083 9.375 6.25 9.375C6.07917 9.375 5.93125 9.43542 5.80625 9.55625C5.68542 9.68125 5.625 9.82917 5.625 10C5.625 10.1708 5.68542 10.3188 5.80625 10.4438L8.30625 12.9437C8.43125 13.0646 8.57917 13.125 8.75 13.125C8.92083 13.125 9.06875 13.0646 9.19375 12.9437L14.1937 7.94375C14.3146 7.81875 14.375 7.67083 14.375 7.5C14.375 7.32917 14.3146 7.18125 14.1937 7.05625C14.0687 6.93542 13.9208 6.875 13.75 6.875C13.5792 6.875 13.4312 6.93542 13.3062 7.05625L8.75 11.6187L6.69375 9.55625Z',
  caution:
    'M10.5484 2.20158L18.0484 15.9516C18.1317 16.1016 18.1484 16.2599 18.0984 16.4266C18.0484 16.5933 17.9484 16.7183 17.7985 16.8016C17.7027 16.8516 17.6025 16.8766 17.4984 16.8766H2.49842C2.32758 16.8766 2.17967 16.8162 2.05467 16.6953C1.93383 16.5703 1.87342 16.4224 1.87342 16.2516C1.87342 16.1474 1.89842 16.0474 1.94842 15.9516L9.44842 2.20158C9.53175 2.05158 9.65675 1.95158 9.82342 1.90158C9.99008 1.85158 10.1484 1.86825 10.2984 1.95158C10.4067 2.00992 10.4901 2.09325 10.5484 2.20158ZM10.6234 7.50158C10.6234 7.33075 10.563 7.18283 10.4422 7.05783C10.3172 6.937 10.1692 6.87658 9.99842 6.87658C9.82758 6.87658 9.67967 6.937 9.55467 7.05783C9.43383 7.18283 9.37342 7.33075 9.37342 7.50158V10.6266C9.37342 10.7974 9.43383 10.9453 9.55467 11.0703C9.67967 11.1912 9.82758 11.2516 9.99842 11.2516C10.1692 11.2516 10.3172 11.1912 10.4422 11.0703C10.563 10.9453 10.6234 10.7974 10.6234 10.6266V7.50158ZM9.37342 13.1266C9.37342 13.4703 9.65467 13.7516 9.99842 13.7516C10.3422 13.7516 10.6234 13.4703 10.6234 13.1266C10.6234 12.7828 10.3422 12.5016 9.99842 12.5016C9.65467 12.5016 9.37342 12.7828 9.37342 13.1266Z',
  danger:
    'M1.25 10C1.25 7.58333 2.10417 5.52083 3.8125 3.8125C5.52083 2.10417 7.58333 1.25 10 1.25C12.4167 1.25 14.4792 2.10417 16.1875 3.8125C17.8958 5.52083 18.75 7.58333 18.75 10C18.75 12.4167 17.8958 14.4792 16.1875 16.1875C14.4792 17.8958 12.4167 18.75 10 18.75C7.58333 18.75 5.52083 17.8958 3.8125 16.1875C2.10417 14.4792 1.25 12.4167 1.25 10ZM7.94375 7.05625C7.81875 6.93542 7.67083 6.875 7.5 6.875C7.32917 6.875 7.18125 6.93542 7.05625 7.05625C6.93542 7.18125 6.875 7.32917 6.875 7.5C6.875 7.67083 6.93542 7.81875 7.05625 7.94375L9.11875 10L7.05625 12.0562C6.93542 12.1812 6.875 12.3292 6.875 12.5C6.875 12.6708 6.93542 12.8187 7.05625 12.9437C7.18125 13.0646 7.32917 13.125 7.5 13.125C7.67083 13.125 7.81875 13.0646 7.94375 12.9437L10 10.8812L12.0562 12.9437C12.1812 13.0646 12.3292 13.125 12.5 13.125C12.6708 13.125 12.8187 13.0646 12.9437 12.9437C13.0646 12.8187 13.125 12.6708 13.125 12.5C13.125 12.3292 13.0646 12.1812 12.9437 12.0562L10.8812 10L12.9437 7.94375C13.0646 7.81875 13.125 7.67083 13.125 7.5C13.125 7.32917 13.0646 7.18125 12.9437 7.05625C12.8187 6.93542 12.6708 6.875 12.5 6.875C12.3292 6.875 12.1812 6.93542 12.0562 7.05625L10 9.11875L7.94375 7.05625Z',
  info: 'M1.25 10C1.25 7.58333 2.10417 5.52083 3.8125 3.8125C5.52083 2.10417 7.58333 1.25 10 1.25C12.4167 1.25 14.4792 2.10417 16.1875 3.8125C17.8958 5.52083 18.75 7.58333 18.75 10C18.75 12.4167 17.8958 14.4792 16.1875 16.1875C14.4792 17.8958 12.4167 18.75 10 18.75C7.58333 18.75 5.52083 17.8958 3.8125 16.1875C2.10417 14.4792 1.25 12.4167 1.25 10ZM10.625 9.375C10.625 9.20417 10.5646 9.05625 10.4438 8.93125C10.3188 8.81042 10.1708 8.75 10 8.75C9.82917 8.75 9.68125 8.81042 9.55625 8.93125C9.43542 9.05625 9.375 9.20417 9.375 9.375V13.75C9.375 13.9208 9.43542 14.0687 9.55625 14.1937C9.68125 14.3146 9.82917 14.375 10 14.375C10.1708 14.375 10.3188 14.3146 10.4438 14.1937C10.5646 14.0687 10.625 13.9208 10.625 13.75V9.375ZM9.375 6.25C9.375 6.59375 9.65625 6.875 10 6.875C10.3437 6.875 10.625 6.59375 10.625 6.25C10.625 5.90625 10.3437 5.625 10 5.625C9.65625 5.625 9.375 5.90625 9.375 6.25Z',
};

export class LuiStatus extends LitElement {
  static styles = unsafeCSS(styles);

  @property() variant = 'success';
  @property() label = '';
  @property() description = '';
  @property() size = 'md';
  @property({ type: Boolean }) dot = false;
  @property({ type: Boolean }) pulse = false;
  @property({ type: Boolean, attribute: 'hide-label' }) hideLabel = false;

  private get _variant(): Variant {
    return [...FEEDBACK, ...SOCIAL].includes(this.variant as Variant)
      ? (this.variant as Variant)
      : 'success';
  }

  // The size of the label only; the description and the indicator keep theirs.
  private get _size(): (typeof SIZES)[number] {
    return SIZES.includes(this.size as (typeof SIZES)[number])
      ? (this.size as (typeof SIZES)[number])
      : 'md';
  }

  // A feedback status shows its icon unless `dot` asks for the quieter dot.
  // The social statuses have only the dot, with a shape of its own inside.
  private _indicator(variant: Variant) {
    if (this.dot || !(variant in ICONS)) {
      return html`<span class="status__dot"></span>`;
    }
    return html`<svg
      class="status__icon"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path d="${ICONS[variant as keyof typeof ICONS]}" />
    </svg>`;
  }

  render() {
    const variant = this._variant;
    const classes = [
      'status',
      `status--${variant}`,
      `status--${this._size}`,
      this.pulse && 'status--pulse',
    ]
      .filter(Boolean)
      .join(' ');

    // The indicator says the status in colour and shape only, so the text is
    // always there for assistive technology: the label when there is one, the
    // variant's name when there is not. Hidden, it stays out of the layout.
    // A removed attribute sets the property to null, hence the `?? ''`.
    const ownLabel = (this.label ?? '').trim();
    const label = ownLabel || LABELS[variant];
    const hidden = this.hideLabel || !ownLabel;
    const description = (this.description ?? '').trim();
    const labelEl = html`<span
      class="status__label ${hidden ? 'status__label--hidden' : ''}"
      >${label}</span
    >`;

    return html`
      <span class="${classes}">
        <span class="status__indicator" aria-hidden="true"
          >${this._indicator(variant)}</span
        >
        ${hidden && !description
          ? labelEl
          : html`<span class="status__text">
              ${labelEl}
              ${description
                ? html`<span class="status__description">${description}</span>`
                : nothing}
            </span>`}
      </span>
    `;
  }
}
