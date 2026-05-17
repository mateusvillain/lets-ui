import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './divider.scss?inline';

export class LuiDivider extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property() orientation = 'horizontal';

  render() {
    const vertical = this.orientation === 'vertical';
    const verticalClass = vertical ? ' divider--vertical' : '';

    if (this.label) {
      return html`
        <div
          class="divider divider--labeled${verticalClass}"
          role="separator"
          aria-label="${this.label}"
        >
          <span class="divider__label">${this.label}</span>
        </div>
      `;
    }

    return html`<div class="divider${verticalClass}" role="separator"></div>`;
  }
}
