import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './table.scss?inline';

// The cells (`th`, `td`) live in the light DOM, inside the author's own native
// `<table>`, so a shadow-scoped rule can never reach them. The sheet is adopted
// once into whatever root the element sits in (the document or an outer shadow
// root) and is scoped by the `.table` class this component puts on the table.
let sheet: CSSStyleSheet | null = null;

function adopt(root: Document | ShadowRoot) {
  if (typeof CSSStyleSheet === 'undefined' || !('adoptedStyleSheets' in root))
    return;
  sheet ??= new CSSStyleSheet();
  if (!sheet.cssRules.length) sheet.replaceSync(styles);
  if (!root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }
}

export class LuiTable extends LitElement {
  static styles = unsafeCSS(styles);

  /** Borda externa com cantos arredondados. */
  @property({ type: Boolean, reflect: true }) bordered = false;

  /**
   * Nome acessível da região rolável. Só é usado quando a tabela transborda na
   * horizontal; sem ele, cai no `aria-label` da tabela e depois no `<caption>`.
   */
  @property() label = '';

  /**
   * Mantém o cabeçalho visível enquanto as linhas rolam. Só tem efeito com
   * `max-height`: sem altura limitada, a área não rola na vertical.
   */
  @property({ type: Boolean, reflect: true, attribute: 'sticky-header' })
  stickyHeader = false;

  /**
   * Altura máxima da área da tabela; acima disso ela rola na vertical. Um
   * número vale como pixels (`320`); aceita qualquer medida CSS (`20rem`).
   */
  @property({ attribute: 'max-height' }) maxHeight = '';

  @state() private _scrollable = false;
  @state() private _headHeight = 0;
  @state() private _tableName = '';

  private _resizeObserver: ResizeObserver | null = null;

  protected override updated(changed: Map<string, unknown>) {
    if (changed.has('stickyHeader')) {
      this._table?.classList.toggle('table--sticky-header', this.stickyHeader);
    }
    if (changed.has('stickyHeader') || changed.has('maxHeight')) {
      this._measure();
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    adopt(this.getRootNode() as Document | ShadowRoot);
    this._resizeObserver = new ResizeObserver(() => this._measure());
    this._resizeObserver.observe(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  private get _table(): HTMLTableElement | null {
    return this.querySelector(':scope > table');
  }

  private _measure() {
    const table = this._table;
    const wrapper =
      this.renderRoot.querySelector<HTMLElement>('.table-wrapper');
    if (!table || !wrapper) return;
    this._scrollable =
      table.scrollWidth > wrapper.clientWidth ||
      wrapper.scrollHeight > wrapper.clientHeight;
    this._headHeight = this.stickyHeader ? (table.tHead?.offsetHeight ?? 0) : 0;
  }

  private _handleSlotChange() {
    const table = this._table;
    if (!table) return;
    table.classList.add('table');
    table.classList.toggle('table--sticky-header', this.stickyHeader);
    this._tableName =
      table.getAttribute('aria-label') ??
      table.caption?.textContent?.trim() ??
      '';
    this._resizeObserver?.observe(table);
    this._measure();
  }

  render() {
    const scrollable = this._scrollable;
    const max = this.maxHeight.trim();
    // A focused cell scrolled into view must not end up under the sticky header.
    const style = [
      max && `max-height: ${/^\d+(\.\d+)?$/.test(max) ? `${max}px` : max}`,
      this._headHeight && `scroll-padding-top: ${this._headHeight}px`,
    ]
      .filter(Boolean)
      .join('; ');
    const name = this.label || this._tableName || undefined;

    return html`
      <div
        class="table-wrapper ${this.bordered ? 'table-wrapper--bordered' : ''}"
        style="${ifDefined(style || undefined)}"
        role="${ifDefined(scrollable ? 'region' : undefined)}"
        tabindex="${ifDefined(scrollable ? '0' : undefined)}"
        aria-label="${ifDefined(scrollable ? name : undefined)}"
      >
        <slot @slotchange="${this._handleSlotChange}"></slot>
      </div>
    `;
  }
}
