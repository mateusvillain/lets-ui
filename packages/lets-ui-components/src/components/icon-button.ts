import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './icon-button.scss?inline';

export class LuiIconButton extends LitElement {
  static styles = unsafeCSS(styles);

  @property() size = 'md';
  @property() icon = 'x';
  @property() weight = 'outline';
  @property({ type: Boolean }) disabled = false;
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'md';
  }

  render() {
    const ariaLabel = this.ariaLabel || this.icon;
    const weightClass = this.weight === 'solid' ? 'lui-solid' : 'lui';
    return html`
      <button
        class="icon-button icon-button--${this._size}"
        aria-label="${ariaLabel}"
        ?disabled="${this.disabled}"
        ?aria-disabled="${this.disabled}"
      >
        <i class="${weightClass} lui-${this.icon}" aria-hidden="true"></i>
      </button>
    `;
  }
}
