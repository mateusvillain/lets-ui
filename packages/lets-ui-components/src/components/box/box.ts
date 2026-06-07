import { LitElement, unsafeCSS } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import styles from './box.scss?inline';
import {
  resolveSpace,
  resolveRadius,
  resolveBorderWidth,
  resolveBackground,
  resolveBorderColor,
} from '../../utils/layout.js';

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

    const bg = resolveBackground(this.background);
    if (bg) this.style.setProperty('--lui-box-background', bg);
    else this.style.removeProperty('--lui-box-background');

    const radius = resolveRadius(this.borderRadius);
    if (radius) this.style.setProperty('--lui-box-border-radius', radius);
    else this.style.removeProperty('--lui-box-border-radius');

    const borderWidth = resolveBorderWidth(this.borderWidth);
    if (borderWidth)
      this.style.setProperty('--lui-box-border-width', borderWidth);
    else this.style.removeProperty('--lui-box-border-width');

    const borderColor = resolveBorderColor(this.borderColor);
    if (borderColor)
      this.style.setProperty('--lui-box-border-color', borderColor);
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
