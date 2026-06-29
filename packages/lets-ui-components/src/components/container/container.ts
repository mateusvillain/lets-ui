import { LitElement, unsafeCSS } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import styles from './container.scss?inline';
import { resolveSpace } from '../../utils/layout.js';

const SIZE_MAP: Record<string, string> = {
  xs: '480px',
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1440px',
  full: 'none',
};

export class LuiContainer extends LitElement {
  static styles = unsafeCSS(styles);

  @property() size = 'lg';
  @property() padding = '32';
  @property({ type: Boolean }) center = true;
  @property() as = 'div';

  updated() {
    const maxWidth = SIZE_MAP[this.size] ?? this.size;
    this.style.setProperty('--lui-container-max-width', maxWidth);

    const pad = resolveSpace(this.padding);
    if (pad) this.style.setProperty('--lui-container-padding', pad);
    else this.style.removeProperty('--lui-container-padding');

    const margin = this.center ? 'auto' : '0';
    this.style.setProperty('--lui-container-margin-auto', margin);
  }

  render() {
    const tag = unsafeStatic(this.as || 'div');
    const role = this.as === 'section' ? 'region' : '';
    return staticHtml`<${tag} role="${role}"><slot></slot></${tag}>`;
  }
}
