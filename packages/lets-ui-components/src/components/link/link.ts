import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './link.scss?inline';

export class LuiLink extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property() href = '#';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  render() {
    const ariaLabel = this.ariaLabel || this.label || 'Link';
    return html`<a class="link" href="${this.href}" aria-label="${ariaLabel}"
      >${this.label}</a
    >`;
  }
}
