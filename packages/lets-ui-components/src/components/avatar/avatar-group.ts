import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './avatar-group.scss?inline';

const SIZES = ['sm', 'md', 'lg'] as const;

export class LuiAvatarGroup extends LitElement {
  static styles = unsafeCSS(styles);

  // The accessible name of the group: "Project members", say.
  @property() label = '';
  // Empty means the default size. The avatars inherit it unless they set their own.
  @property() size = '';

  private get _size(): (typeof SIZES)[number] | '' {
    return SIZES.includes(this.size as (typeof SIZES)[number])
      ? (this.size as (typeof SIZES)[number])
      : '';
  }

  render() {
    const classes = [
      'avatar-group',
      this._size && `avatar-group--${this._size}`,
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div
        class="${classes}"
        role="group"
        aria-label="${this.label || nothing}"
      >
        <slot></slot>
      </div>
    `;
  }
}
