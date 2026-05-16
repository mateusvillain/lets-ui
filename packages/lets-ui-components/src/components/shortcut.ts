import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './shortcut.scss?inline';

export class LuiShortcut extends LitElement {
  static styles = unsafeCSS(styles);

  @property() keys = '';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  render() {
    const parsedKeys = this.keys
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const label = this.ariaLabel || parsedKeys.join(' + ');

    return html`
      <span class="shortcut" aria-label="${label}" role="group">
        ${parsedKeys.map(
          (key, i) => html`
            <kbd class="shortcut__key">${key}</kbd>
            ${i < parsedKeys.length - 1
              ? html`<span class="shortcut__sep" aria-hidden="true">+</span>`
              : ''}
          `
        )}
      </span>
    `;
  }
}
