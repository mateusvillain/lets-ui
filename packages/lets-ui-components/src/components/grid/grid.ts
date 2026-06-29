import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './grid.scss?inline';
import gridItemStyles from './grid-item.scss?inline';
import { resolveSpace, ALIGN_MAP, JUSTIFY_MAP } from '../../utils/layout.js';

export class LuiGrid extends LitElement {
  static styles = unsafeCSS(styles);

  @property() columns = '';
  @property() rows = '';
  @property() gap = '16';
  @property({ attribute: 'gap-x' }) gapX = '';
  @property({ attribute: 'gap-y' }) gapY = '';
  @property() align = 'stretch';
  @property() justify = 'stretch';

  updated() {
    if (this.columns)
      this.style.setProperty('--lui-grid-columns', this.columns);
    else this.style.removeProperty('--lui-grid-columns');

    if (this.rows) this.style.setProperty('--lui-grid-rows', this.rows);
    else this.style.removeProperty('--lui-grid-rows');

    if (this.gapX || this.gapY) {
      const gx = resolveSpace(this.gapX) ?? resolveSpace(this.gap) ?? '0';
      const gy = resolveSpace(this.gapY) ?? resolveSpace(this.gap) ?? '0';
      this.style.setProperty('--lui-grid-gap', `${gy} ${gx}`);
    } else {
      const gap = resolveSpace(this.gap);
      if (gap) this.style.setProperty('--lui-grid-gap', gap);
      else this.style.removeProperty('--lui-grid-gap');
    }

    const align = ALIGN_MAP[this.align] ?? this.align;
    this.style.setProperty('--lui-grid-align', align);

    const justify = JUSTIFY_MAP[this.justify] ?? this.justify;
    this.style.setProperty('--lui-grid-justify', justify);
  }

  render() {
    return html`<slot></slot>`;
  }
}

export class LuiGridItem extends LitElement {
  static styles = unsafeCSS(gridItemStyles);

  @property({ attribute: 'col-span' }) colSpan = '';
  @property({ attribute: 'row-span' }) rowSpan = '';
  @property({ attribute: 'col-start' }) colStart = '';
  @property({ attribute: 'col-end' }) colEnd = '';
  @property({ attribute: 'row-start' }) rowStart = '';
  @property({ attribute: 'row-end' }) rowEnd = '';

  updated() {
    let col = 'auto';
    if (this.colStart && this.colEnd) col = `${this.colStart} / ${this.colEnd}`;
    else if (this.colStart) col = `${this.colStart} / span 1`;
    else if (this.colSpan) col = `span ${this.colSpan}`;

    let row = 'auto';
    if (this.rowStart && this.rowEnd) row = `${this.rowStart} / ${this.rowEnd}`;
    else if (this.rowStart) row = `${this.rowStart} / span 1`;
    else if (this.rowSpan) row = `span ${this.rowSpan}`;

    this.style.setProperty('--lui-grid-item-col', col);
    this.style.setProperty('--lui-grid-item-row', row);
  }

  render() {
    return html`<slot></slot>`;
  }
}
