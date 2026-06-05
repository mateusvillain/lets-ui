import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './bleed.scss?inline';
import { resolveSpace } from '../../utils/layout.js';

const DEFAULT_BLEED =
  'calc(-1 * var(--lui-container-padding, var(--lui-spacing-fluid-32)))';

export class LuiBleed extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Boolean }) horizontal = false;
  @property({ type: Boolean }) vertical = false;
  @property({ type: Boolean }) left = false;
  @property({ type: Boolean }) right = false;
  @property({ type: Boolean }) top = false;
  @property({ type: Boolean }) bottom = false;
  @property() amount = '';

  updated() {
    const bleedValue = this.amount
      ? `calc(-1 * ${resolveSpace(this.amount) ?? this.amount})`
      : DEFAULT_BLEED;

    const applyLeft = this.horizontal || this.left;
    const applyRight = this.horizontal || this.right;
    const applyTop = this.vertical || this.top;
    const applyBottom = this.vertical || this.bottom;

    this.style.setProperty('--lui-bleed-left', applyLeft ? bleedValue : '0');
    this.style.setProperty('--lui-bleed-right', applyRight ? bleedValue : '0');
    this.style.setProperty('--lui-bleed-top', applyTop ? bleedValue : '0');
    this.style.setProperty(
      '--lui-bleed-bottom',
      applyBottom ? bleedValue : '0'
    );
  }

  render() {
    return html`<div class="bleed"><slot></slot></div>`;
  }
}
