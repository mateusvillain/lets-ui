import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './link.scss?inline';

export class LuiLink extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property() href = '#';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  render() {
    return html`<a
      class="link"
      href="${this.href}"
      aria-label="${ifDefined(this.ariaLabel || undefined)}"
      ><slot>${this.label}</slot></a
    >`;
  }
}
