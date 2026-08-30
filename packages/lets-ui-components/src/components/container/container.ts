import { LitElement, unsafeCSS } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import styles from './container.scss?inline';
import { resolveSpace } from '../../utils/layout.js';
import staticTokens from '@lets-ui/tokens/static';

// The size scale mirrors the breakpoint scale, read from the same tokens the
// CSS-only `.container` compiles against, so the two cannot drift. `xs` is the
// one rung with no breakpoint behind it — there is no step below `sm` to point
// at, since `1xs` is the top of the mobile range rather than a width the
// layout snaps to.
const breakpoint = (name: string): string =>
  staticTokens[`lui.brand.grid.breakpoint.${name}`];

const SIZE_MAP: Record<string, string> = {
  xs: '480px',
  sm: breakpoint('sm'),
  md: breakpoint('md'),
  lg: breakpoint('lg'),
  xl: breakpoint('1xl'),
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
