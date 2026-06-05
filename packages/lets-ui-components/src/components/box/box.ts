import { LitElement, unsafeCSS } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import styles from './box.scss?inline';
import { resolveSpace } from '../../utils/layout.js';

export class LuiBox extends LitElement {
  static styles = unsafeCSS(styles);

  @property() as = 'div';
  @property() padding = '';
  @property({ attribute: 'padding-x' }) paddingX = '';
  @property({ attribute: 'padding-y' }) paddingY = '';
  @property() background = '';
  @property({ attribute: 'border-radius' }) borderRadius = '';
  @property({ attribute: 'border-width' }) borderWidth = '';
  @property({ attribute: 'border-color' }) borderColor = '';
  @property() overflow = '';

  updated() {
    const pt = resolveSpace(this.paddingY || this.padding);
    const pb = resolveSpace(this.paddingY || this.padding);
    const pl = resolveSpace(this.paddingX || this.padding);
    const pr = resolveSpace(this.paddingX || this.padding);

    if (pt) this.style.setProperty('--lui-box-pt', pt);
    else this.style.removeProperty('--lui-box-pt');

    if (pb) this.style.setProperty('--lui-box-pb', pb);
    else this.style.removeProperty('--lui-box-pb');

    if (pl) this.style.setProperty('--lui-box-pl', pl);
    else this.style.removeProperty('--lui-box-pl');

    if (pr) this.style.setProperty('--lui-box-pr', pr);
    else this.style.removeProperty('--lui-box-pr');

    if (this.background)
      this.style.setProperty('--lui-box-background', this.background);
    else this.style.removeProperty('--lui-box-background');

    if (this.borderRadius)
      this.style.setProperty('--lui-box-border-radius', this.borderRadius);
    else this.style.removeProperty('--lui-box-border-radius');

    if (this.borderWidth)
      this.style.setProperty('--lui-box-border-width', this.borderWidth);
    else this.style.removeProperty('--lui-box-border-width');

    if (this.borderColor)
      this.style.setProperty('--lui-box-border-color', this.borderColor);
    else this.style.removeProperty('--lui-box-border-color');

    if (this.overflow)
      this.style.setProperty('--lui-box-overflow', this.overflow);
    else this.style.removeProperty('--lui-box-overflow');
  }

  render() {
    const tag = unsafeStatic(this.as || 'div');
    const role = this.as === 'section' ? 'region' : '';
    return staticHtml`<${tag} class="box" role="${role}"><slot></slot></${tag}>`;
  }
}
