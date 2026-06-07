import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './columns.scss?inline';
import columnStyles from './column.scss?inline';
import { resolveSpace, ALIGN_MAP } from '../../utils/layout.js';

function parseColumns(value: string): string {
  const num = parseInt(value, 10);
  if (!isNaN(num) && num > 0) return `repeat(${num}, 1fr)`;

  // Try parsing as JSON array: ["2fr", "1fr"]
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(' ');
  } catch (_) {
    // not JSON — treat as raw CSS value
  }

  return value;
}

export class LuiColumns extends LitElement {
  static styles = unsafeCSS(styles);

  @property() columns = '2';
  @property() gap = 'md';
  @property({ attribute: 'gap-x' }) gapX = '';
  @property({ attribute: 'gap-y' }) gapY = '';
  @property() align = 'stretch';
  @property({ reflect: true, attribute: 'collapse-below' }) collapseBelow = '';

  updated() {
    const template = parseColumns(this.columns);
    this.style.setProperty('--lui-columns-template', template);

    if (this.gapX || this.gapY) {
      const gx = resolveSpace(this.gapX) ?? resolveSpace(this.gap) ?? '0';
      const gy = resolveSpace(this.gapY) ?? resolveSpace(this.gap) ?? '0';
      this.style.setProperty('--lui-columns-gap', `${gy} ${gx}`);
    } else {
      const gap = resolveSpace(this.gap);
      if (gap) this.style.setProperty('--lui-columns-gap', gap);
      else this.style.removeProperty('--lui-columns-gap');
    }

    const align = ALIGN_MAP[this.align] ?? this.align;
    this.style.setProperty('--lui-columns-align', align);
  }

  render() {
    return html`<slot></slot>`;
  }
}

export class LuiColumn extends LitElement {
  static styles = unsafeCSS(columnStyles);

  @property() span = '';
  @property() width = '';

  updated() {
    if (this.span) {
      this.style.setProperty('--lui-column-span', `span ${this.span}`);
    } else {
      this.style.removeProperty('--lui-column-span');
    }

    if (this.width) {
      this.style.setProperty('--lui-column-width', this.width);
    } else {
      this.style.removeProperty('--lui-column-width');
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
