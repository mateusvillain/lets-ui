import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tag.scss?inline';

export class LuiTag extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = 'Tag';
  @property({ attribute: 'style' }) tagStyle = 'surface';
  @property() variant = 'primary';
  @property() size = 'md';
  @property({ type: Boolean }) circle = false;

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'md';
  }

  render() {
    const classes = [
      `tag--${this.tagStyle}-${this.variant}`,
      `tag--${this._size}`,
      this.circle ? 'tag--circle' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`<div class="${classes}">${this.label}</div>`;
  }
}
