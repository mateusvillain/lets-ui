import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './sidebar.scss?inline';
import { resolveSpace, ALIGN_MAP } from '../../utils/layout.js';

export class LuiSidebar extends LitElement {
  static styles = unsafeCSS(styles);

  @property() side = 'start';
  @property({ attribute: 'side-width' }) sideWidth = '240px';
  @property({ attribute: 'content-min-width' }) contentMinWidth = '50%';
  @property() gap = 'lg';
  @property() align = 'stretch';

  updated() {
    const gap = resolveSpace(this.gap);
    if (gap) this.style.setProperty('--lui-sidebar-gap', gap);
    else this.style.removeProperty('--lui-sidebar-gap');

    this.style.setProperty(
      '--lui-sidebar-side-width',
      this.sideWidth || '240px'
    );
    this.style.setProperty(
      '--lui-sidebar-content-min-width',
      this.contentMinWidth || '50%'
    );

    const align = ALIGN_MAP[this.align] ?? this.align;
    this.style.setProperty('--lui-sidebar-align', align);
  }

  render() {
    const isEnd = this.side === 'end';
    return html`
      <div class="sidebar${isEnd ? ' sidebar--end' : ''}">
        <div class="sidebar__side"><slot name="sidebar"></slot></div>
        <div class="sidebar__content"><slot name="content"></slot></div>
      </div>
    `;
  }
}
