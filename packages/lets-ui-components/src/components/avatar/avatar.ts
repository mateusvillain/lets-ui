import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './avatar.scss?inline';

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
          : html`<span class="avatar__initials" aria-hidden="true"
              >${initials}</span
            >`}
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
