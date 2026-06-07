import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './center.scss?inline';

export class LuiCenter extends LitElement {
  static styles = unsafeCSS(styles);

  @property() axis = 'both';
  @property({ attribute: 'min-height' }) minHeight = '';
  @property({ attribute: 'max-width' }) maxWidth = '';
  @property() as = 'div';

  updated() {
    if (this.axis === 'horizontal') {
      this.style.setProperty('--lui-center-align', 'stretch');
      this.style.setProperty('--lui-center-justify', 'center');
    } else if (this.axis === 'vertical') {
      this.style.setProperty('--lui-center-align', 'center');
      this.style.setProperty('--lui-center-justify', 'flex-start');
    } else {
      this.style.setProperty('--lui-center-align', 'center');
      this.style.setProperty('--lui-center-justify', 'center');
    }

    if (this.minHeight)
      this.style.setProperty('--lui-center-min-height', this.minHeight);
    else this.style.removeProperty('--lui-center-min-height');

    if (this.maxWidth)
      this.style.setProperty('--lui-center-max-width', this.maxWidth);
    else this.style.removeProperty('--lui-center-max-width');
  }

  render() {
    return html`<div class="center__inner"><slot></slot></div>`;
  }
}
