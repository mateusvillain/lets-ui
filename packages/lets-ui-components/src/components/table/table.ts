import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './table.scss?inline';

// The cells (`th`, `td`) live in the light DOM, inside the author's own native
// `<table>`, so a shadow-scoped rule can never reach them. The sheet is added
// once to whatever root the element sits in (the document or an outer shadow
// root) and is scoped by the `.table` class this component puts on the table.
// A constructed sheet belongs to the document that built it, so there is one
// per document (an iframe gets its own); where `adoptedStyleSheets` is missing,
// a `<style>` element does the same job.
const sheets = new WeakMap<Document, CSSStyleSheet>();

function adopt(root: Document | ShadowRoot) {
  const doc = root instanceof Document ? root : root.ownerDocument;

  if (!('adoptedStyleSheets' in root)) {
    const host = root instanceof Document ? doc.head : root;
    if (host.querySelector(':scope > style[data-lui-table]')) return;
    const style = doc.createElement('style');
    style.dataset.luiTable = '';
    style.textContent = styles;
    host.append(style);
    return;
  }

  let sheet = sheets.get(doc);
  if (!sheet) {
    const SheetCtor = (doc.defaultView?.CSSStyleSheet ??
      CSSStyleSheet) as typeof CSSStyleSheet;
    sheet = new SheetCtor();
    sheet.replaceSync(styles);
    sheets.set(doc, sheet);
  }
  if (!root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }
}

type SortDirection = 'none' | 'ascending' | 'descending';

// A column goes ascending, then descending, then back to unsorted, so the
// consumer can restore the original order.
const NEXT_DIRECTION: Record<SortDirection, SortDirection> = {
  none: 'ascending',
  ascending: 'descending',
  descending: 'none',
};

export class LuiTable extends LitElement {
  static styles = unsafeCSS(styles);

  /** Borda externa com cantos arredondados. */
  @property({ type: Boolean, reflect: true }) bordered = false;

  /**
   * Nome acessível da região rolável. Só é usado quando a tabela transborda na
   * horizontal; sem ele, cai no nome da tabela: `aria-labelledby`, `aria-label` e depois
   * `<caption>`.
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
  private _mutationObserver: MutationObserver | null = null;

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
    this._mutationObserver = new MutationObserver(() => this._readName());
    this.addEventListener('click', this._handleClick);
    this._observe();
    this._readName();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._mutationObserver?.disconnect();
    this.removeEventListener('click', this._handleClick);
    this._resizeObserver = null;
    this._mutationObserver = null;
  }

  // Starts from scratch every time, so a table that was replaced or a host that
  // was moved and put back is watched again, and the old one is let go.
  private _observe() {
    this._resizeObserver?.disconnect();
    this._mutationObserver?.disconnect();
    this._resizeObserver?.observe(this);
    const table = this._table;
    if (!table) return;
    this._resizeObserver?.observe(table);
    this._mutationObserver?.observe(table, {
      attributes: true,
      attributeFilter: ['aria-label', 'aria-labelledby'],
      childList: true,
      characterData: true,
      subtree: true,
    });
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

  // The name the table already has, in the order the accessible name
  // computation uses: `aria-labelledby`, then `aria-label`, then the caption. An
  // empty `aria-label` counts as absent.
  private _readName() {
    const table = this._table;
    if (!table) {
      this._tableName = '';
      return;
    }
    const root = this.getRootNode() as Document | ShadowRoot;
    const labelled = (table.getAttribute('aria-labelledby') ?? '')
      .split(/\s+/)
      .map((id) => (id ? root.getElementById(id)?.textContent?.trim() : ''))
      .filter(Boolean)
      .join(' ');
    this._tableName =
      labelled ||
      table.getAttribute('aria-label')?.trim() ||
      table.caption?.textContent?.trim() ||
      '';
  }

  // The header cells that hold a sort button, from this table only: a table
  // nested in a cell has its own.
  private get _sortableHeaders(): HTMLTableCellElement[] {
    return [
      ...(this._table?.querySelectorAll<HTMLTableCellElement>(
        ':scope > thead > tr > th'
      ) ?? []),
    ].filter((th) => th.querySelector(':scope > .table__sort'));
  }

  // `aria-sort` has to be on every sortable header, or a column that was never
  // sorted is announced as not sortable at all.
  private _prepareSortable() {
    this._sortableHeaders.forEach((th) => {
      if (!th.hasAttribute('aria-sort')) th.setAttribute('aria-sort', 'none');
    });
  }

  private _handleClick = (event: Event) => {
    const button = (event.target as Element).closest('.table__sort');
    const th = button?.closest('th');
    if (!button || !th || !this._sortableHeaders.includes(th)) return;

    const current = (th.getAttribute('aria-sort') ?? 'none') as SortDirection;
    const direction = NEXT_DIRECTION[current] ?? 'ascending';

    // One column at a time: sorting a column clears the others.
    this._sortableHeaders.forEach((header) =>
      header.setAttribute('aria-sort', header === th ? direction : 'none')
    );

    this.dispatchEvent(
      new CustomEvent('lui-sort', {
        bubbles: true,
        composed: true,
        detail: {
          column: th.dataset.column ?? button.textContent?.trim() ?? '',
          direction,
        },
      })
    );
  };

  private _handleSlotChange() {
    const table = this._table;
    if (!table) return;
    table.classList.add('table');
    table.classList.toggle('table--sticky-header', this.stickyHeader);
    this._observe();
    this._readName();
    this._prepareSortable();
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
