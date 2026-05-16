import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './button.scss?inline';

export class LuiButton extends LitElement {
  static styles = unsafeCSS(styles);

  @property() variant = 'primary';
  @property() size = 'lg';
  @property({ type: Boolean }) disabled = false;
  @property() label = '';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'lg';
  }

  render() {
    const ariaLabel = this.ariaLabel || this.label || 'Button';
    return html`
      <button
        class="btn btn--${this.variant} btn--${this._size}"
        aria-label="${ariaLabel}"
        ?disabled="${this.disabled}"
        ?aria-disabled="${this.disabled}"
      >
        ${this.label}
      </button>
    `;
  }
}
