import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './grid.scss?inline';
import gridItemStyles from './grid-item.scss?inline';

// Mirrors `packages/styles/src/utilities/_grid.map.scss`: the column count
// available at each breakpoint. Spans are clamped to it so an item can never
// overflow the row.
const COLUMNS: Record<string, number> = {
  '1xs': 4,
  sm: 8,
  md: 8,
  lg: 12,
  '1xl': 12,
};

const ALIGN = new Set(['start', 'center', 'end', 'stretch']);

function resolveSpan(value: string, breakpoint: string): string | null {
  if (!value) return null;
  if (value === 'full') return '1 / -1';

  const span = parseInt(value, 10);
  if (isNaN(span) || span < 1) return null;

  return `span ${Math.min(span, COLUMNS[breakpoint])}`;
}

export class LuiGrid extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ reflect: true, type: Boolean }) flush = false;
  @property() align = 'stretch';

  connectedCallback() {
    super.connectedCallback();

    // A grid nested in a grid item already sits inside a parent track, so it
    // must never re-apply the page margin or the max-width.
    if (this.parentElement?.tagName === 'LUI-GRID-ITEM') {
      this.flush = true;
    }
  }

  updated() {
    if (ALIGN.has(this.align)) {
      this.style.setProperty('--lui-grid-align', this.align);
    } else {
      this.style.removeProperty('--lui-grid-align');
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

export class LuiGridItem extends LitElement {
  static styles = unsafeCSS(gridItemStyles);

  @property() span = '';
  @property({ attribute: 'span-sm' }) spanSm = '';
  @property({ attribute: 'span-md' }) spanMd = '';
  @property({ attribute: 'span-lg' }) spanLg = '';
  @property({ attribute: 'span-1xl' }) span1xl = '';

  updated() {
    const spans: Record<string, string> = {
      '1xs': this.span,
      sm: this.spanSm,
      md: this.spanMd,
      lg: this.spanLg,
      '1xl': this.span1xl,
    };

    for (const [breakpoint, value] of Object.entries(spans)) {
      const resolved = resolveSpan(value, breakpoint);
      const property = `--lui-grid-item-${breakpoint}`;

      if (resolved) this.style.setProperty(property, resolved);
      else this.style.removeProperty(property);
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
