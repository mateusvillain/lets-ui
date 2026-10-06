import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './avatar.scss?inline';

// The placeholder for an avatar with no photo and no initials. It paints with
// `currentColor`, so it takes the variant's colour like the initials do.
const PERSON_PATH =
  'M18,20.25L18,19.5C18,18.3065,17.5255,17.1623,16.6816,16.3184C15.8377,15.4745,14.6935,15,13.5,15L10.5,15C9.3065,15,8.1623,15.4745,7.3184,16.3184C6.4745,17.1623,6,18.3065,6,19.5L6,20.25C6,20.6642,5.6642,21,5.25,21C4.8358,21,4.5,20.6642,4.5,20.25L4.5,19.5C4.5,17.9087,5.1326,16.383,6.2578,15.2578C7.383,14.1326,8.9087,13.5,10.5,13.5L13.5,13.5C15.0913,13.5,16.617,14.1326,17.7422,15.2578C18.8674,16.383,19.5,17.9087,19.5,19.5L19.5,20.25C19.5,20.6642,19.1642,21,18.75,21C18.3358,21,18,20.6642,18,20.25ZM15,7.5C15,6.7043,14.6837,5.9415,14.1211,5.3789C13.5585,4.8163,12.7957,4.5,12,4.5C11.2043,4.5,10.4415,4.8163,9.8789,5.3789C9.3163,5.9415,9,6.7043,9,7.5C9,8.2957,9.3163,9.0585,9.8789,9.6211C10.4415,10.1837,11.2043,10.5,12,10.5C12.7957,10.5,13.5585,10.1837,14.1211,9.6211C14.6837,9.0585,15,8.2957,15,7.5ZM16.5,7.5C16.5,8.6935,16.0255,9.8377,15.1816,10.6816C14.3377,11.5255,13.1935,12,12,12C10.8065,12,9.6623,11.5255,8.8184,10.6816C7.9745,9.8377,7.5,8.6935,7.5,7.5C7.5,6.3065,7.9745,5.1623,8.8184,4.3184C9.6623,3.4745,10.8065,3,12,3C13.1935,3,14.3377,3.4745,15.1816,4.3184C16.0255,5.1623,16.5,6.3065,16.5,7.5Z';

const SIZES = ['sm', 'md', 'lg'] as const;
const RADII = ['circle', 'rounded', 'square'] as const;
const VARIANTS = ['gray', 'blue', 'green', 'orange', 'red', 'violet'] as const;
const STATUSES = ['online', 'away', 'busy', 'offline'] as const;

const STATUS_LABELS = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

// First letter of the first and of the last word: "Maria Villain" → "MV".
function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : '';
  return (first + last).toUpperCase();
}

export class LuiAvatar extends LitElement {
  static styles = unsafeCSS(styles);

  @property() name = '';
  @property() src = '';
  @property() initials = '';
  @property() variant = 'gray';
  @property() size = '';
  @property() radius = 'circle';
  @property() status = '';
  @property({ attribute: 'status-label' }) statusLabel = '';

  // A photo that fails to load falls back to the initials.
  @state() private _imageFailed = false;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('src')) this._imageFailed = false;
  }

  private get _variant(): (typeof VARIANTS)[number] {
    return VARIANTS.includes(this.variant as (typeof VARIANTS)[number])
      ? (this.variant as (typeof VARIANTS)[number])
      : 'gray';
  }

  private get _radius(): (typeof RADII)[number] {
    return RADII.includes(this.radius as (typeof RADII)[number])
      ? (this.radius as (typeof RADII)[number])
      : 'circle';
  }

  // No size of its own means the avatar takes the one its group sets, or the
  // default size when it stands alone.
  private get _size(): (typeof SIZES)[number] | '' {
    return SIZES.includes(this.size as (typeof SIZES)[number])
      ? (this.size as (typeof SIZES)[number])
      : '';
  }

  private get _status(): (typeof STATUSES)[number] | '' {
    return STATUSES.includes(this.status as (typeof STATUSES)[number])
      ? (this.status as (typeof STATUSES)[number])
      : '';
  }

  // The name and the status read as one: "Maria Villain, Online". The status is
  // text here because the dot alone says it in colour only. An avatar with
  // neither is decorative and stays out of the accessibility tree.
  private get _accessibleName(): string {
    const status = this._status
      ? this.statusLabel || STATUS_LABELS[this._status]
      : '';
    return [this.name.trim(), status].filter(Boolean).join(', ');
  }

  render() {
    const classes = [
      'avatar',
      this._size && `avatar--${this._size}`,
      `avatar--${this._radius}`,
      `avatar--${this._variant}`,
    ]
      .filter(Boolean)
      .join(' ');
    const label = this._accessibleName;
    const showImage = this.src && !this._imageFailed;
    const initials = this.initials || initialsFrom(this.name);

    return html`
      <span
        class="${classes}"
        role="${label ? 'img' : nothing}"
        aria-label="${label || nothing}"
        aria-hidden="${label ? nothing : 'true'}"
      >
        ${showImage
          ? html`<img
              class="avatar__image"
              src="${this.src}"
              alt=""
              loading="lazy"
              decoding="async"
              @error="${() => {
                this._imageFailed = true;
              }}"
            />`
          : initials
            ? html`<span class="avatar__initials" aria-hidden="true"
                >${initials}</span
              >`
            : html`<svg
                class="avatar__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="${PERSON_PATH}" />
              </svg>`}
        ${this._status
          ? html`<span
              class="avatar__status avatar__status--${this._status}"
              aria-hidden="true"
            ></span>`
          : nothing}
      </span>
    `;
  }
}
