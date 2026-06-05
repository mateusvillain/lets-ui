import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './switcher.scss?inline';
import { resolveSpace } from '../../utils/layout.js';

export class LuiSwitcher extends LitElement {
  static styles = unsafeCSS(styles);

  @property() threshold = '320px';
  @property() gap = 'md';
  @property() limit = '';

  updated() {
    this.style.setProperty(
      '--lui-switcher-threshold',
      this.threshold || '320px'
    );

    const gap = resolveSpace(this.gap);
    if (gap) this.style.setProperty('--lui-switcher-gap', gap);
    else this.style.removeProperty('--lui-switcher-gap');
  }

  render() {
    return html`<slot></slot>`;
  }
}
