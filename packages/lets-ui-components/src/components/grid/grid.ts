import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './grid.scss?inline';
import gridItemStyles from './grid-item.scss?inline';
import staticTokens from '@lets-ui/tokens/static';

// The column count available at each breakpoint, read from the same tokens the
// SCSS compiles against — `packages/styles/src/utilities/_grid.map.scss` builds
// its tracks and its `.col-*` utilities from these exact numbers, so a brand
// that redefines them cannot leave the clamp here disagreeing with the grid.
// Spans are clamped to the count so a cell can never overflow the row.
const COLUMN_PREFIX = 'lui.brand.grid.column.';

const COLUMNS: Record<string, number> = Object.fromEntries(
  Object.entries(staticTokens)
    .filter(([id]) => id.startsWith(COLUMN_PREFIX))
    .map(([id, value]) => [id.slice(COLUMN_PREFIX.length), Number(value)])
);

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

  @property() col = '';
  @property({ attribute: 'col-sm' }) colSm = '';
  @property({ attribute: 'col-md' }) colMd = '';
  @property({ attribute: 'col-lg' }) colLg = '';
  @property({ attribute: 'col-1xl' }) col1xl = '';

  updated() {
    const cols: Record<string, string> = {
      '1xs': this.col,
      sm: this.colSm,
      md: this.colMd,
      lg: this.colLg,
      '1xl': this.col1xl,
    };

    for (const [breakpoint, value] of Object.entries(cols)) {
      const resolved = resolveSpan(value, breakpoint);
      const property = `--lui-grid-col-${breakpoint}`;

      if (resolved) this.style.setProperty(property, resolved);
      else this.style.removeProperty(property);
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
