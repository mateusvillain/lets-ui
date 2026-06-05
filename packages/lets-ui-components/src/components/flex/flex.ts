import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './flex.scss?inline';
import flexItemStyles from './flex-item.scss?inline';
import { resolveSpace, ALIGN_MAP, JUSTIFY_MAP } from '../../utils/layout.js';

export class LuiFlex extends LitElement {
  static styles = unsafeCSS(styles);

  @property() direction = 'row';
  @property() wrap = 'nowrap';
  @property() gap = '';
  @property({ attribute: 'gap-x' }) gapX = '';
  @property({ attribute: 'gap-y' }) gapY = '';
  @property() align = 'stretch';
  @property() justify = 'start';
  @property({ type: Boolean }) inline = false;

  updated() {
    this.style.setProperty(
      '--lui-flex-display',
      this.inline ? 'inline-flex' : 'flex'
    );
    this.style.setProperty('--lui-flex-direction', this.direction);
    this.style.setProperty('--lui-flex-wrap', this.wrap);

    if (this.gapX || this.gapY) {
      const gx = resolveSpace(this.gapX) ?? resolveSpace(this.gap) ?? '0';
      const gy = resolveSpace(this.gapY) ?? resolveSpace(this.gap) ?? '0';
      this.style.setProperty('--lui-flex-gap', `${gy} ${gx}`);
    } else {
      const gap = resolveSpace(this.gap);
      if (gap) this.style.setProperty('--lui-flex-gap', gap);
      else this.style.setProperty('--lui-flex-gap', '0');
    }

    const align = ALIGN_MAP[this.align] ?? this.align;
    this.style.setProperty('--lui-flex-align', align);

    const justify = JUSTIFY_MAP[this.justify] ?? this.justify;
    this.style.setProperty('--lui-flex-justify', justify);
  }

  render() {
    return html`<slot></slot>`;
  }
}

export class LuiFlexItem extends LitElement {
  static styles = unsafeCSS(flexItemStyles);

  @property() grow = '';
  @property() shrink = '';
  @property() basis = '';
  @property() align = '';
  @property() order = '';

  updated() {
    if (this.grow !== '')
      this.style.setProperty('--lui-flex-item-grow', this.grow);
    else this.style.removeProperty('--lui-flex-item-grow');

    if (this.shrink !== '')
      this.style.setProperty('--lui-flex-item-shrink', this.shrink);
    else this.style.removeProperty('--lui-flex-item-shrink');

    if (this.basis) this.style.setProperty('--lui-flex-item-basis', this.basis);
    else this.style.removeProperty('--lui-flex-item-basis');

    if (this.align) {
      const mapped = ALIGN_MAP[this.align] ?? this.align;
      this.style.setProperty('--lui-flex-item-align', mapped);
    } else {
      this.style.removeProperty('--lui-flex-item-align');
    }

    if (this.order !== '')
      this.style.setProperty('--lui-flex-item-order', this.order);
    else this.style.removeProperty('--lui-flex-item-order');
  }

  render() {
    return html`<slot></slot>`;
  }
}
