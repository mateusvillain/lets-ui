import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './stack.scss?inline';
import { resolveSpace, ALIGN_MAP, JUSTIFY_MAP } from '../../utils/layout.js';

export class LuiStack extends LitElement {
  static styles = unsafeCSS(styles);

  @property() gap = 'md';
  @property() align = 'stretch';
  @property() justify = 'start';

  updated() {
    const gap = resolveSpace(this.gap);
    const align = ALIGN_MAP[this.align] ?? this.align;
    const justify = JUSTIFY_MAP[this.justify] ?? this.justify;

    if (gap) this.style.setProperty('--lui-stack-gap', gap);
    else this.style.removeProperty('--lui-stack-gap');

    this.style.setProperty('--lui-stack-align', align);
    this.style.setProperty('--lui-stack-justify', justify);
  }

  render() {
    return html`<slot></slot>`;
  }
}
