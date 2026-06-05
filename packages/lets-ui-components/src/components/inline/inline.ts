import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './inline.scss?inline';
import { resolveSpace, ALIGN_MAP, JUSTIFY_MAP } from '../../utils/layout.js';

export class LuiInline extends LitElement {
  static styles = unsafeCSS(styles);

  @property() gap = 'sm';
  @property({ attribute: 'gap-x' }) gapX = '';
  @property({ attribute: 'gap-y' }) gapY = '';
  @property() align = 'center';
  @property() justify = 'start';
  @property() wrap = 'wrap';

  updated() {
    const align = ALIGN_MAP[this.align] ?? this.align;
    const justify = JUSTIFY_MAP[this.justify] ?? this.justify;

    if (this.gapX || this.gapY) {
      const gx = resolveSpace(this.gapX) ?? resolveSpace(this.gap) ?? '0';
      const gy = resolveSpace(this.gapY) ?? resolveSpace(this.gap) ?? '0';
      this.style.setProperty('--lui-inline-gap', `${gy} ${gx}`);
    } else {
      const gap = resolveSpace(this.gap);
      if (gap) this.style.setProperty('--lui-inline-gap', gap);
      else this.style.removeProperty('--lui-inline-gap');
    }

    this.style.setProperty('--lui-inline-align', align);
    this.style.setProperty('--lui-inline-justify', justify);
    this.style.setProperty('--lui-inline-wrap', this.wrap);
  }

  render() {
    return html`<slot></slot>`;
  }
}
