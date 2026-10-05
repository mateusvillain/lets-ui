import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './table.scss?inline';
import type { LuiCheckbox } from '../checkbox/checkbox.js';

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
   * Liga a seleção de linhas. O `lui-checkbox` do `<thead>` seleciona tudo e
   * cada `lui-checkbox` do `<tbody>` seleciona uma linha; o do cabeçalho passa
   * a refletir o conjunto (marcado, desmarcado ou misto).
   */
  @property({ type: Boolean, reflect: true }) selectable = false;

  /**
   * Texto anunciado a leitores de tela quando a seleção muda. `{count}` e
   * `{total}` são substituídos pelos números.
   */
  @property({ attribute: 'selection-label' })
  selectionLabel = '{count} of {total} rows selected';

  @state() private _scrollable = false;
  @state() private _announcement = '';
  @state() private _tableName = '';

  private _resizeObserver: ResizeObserver | null = null;

  override connectedCallback() {
    super.connectedCallback();
    adopt(this.getRootNode() as Document | ShadowRoot);
    this._resizeObserver = new ResizeObserver(() => this._measure());
    this._resizeObserver.observe(this);
    this.addEventListener('change', this._handleChange);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this.removeEventListener('change', this._handleChange);
  }

  private get _table(): HTMLTableElement | null {
    return this.querySelector(':scope > table');
  }

  private get _headCheckbox(): LuiCheckbox | null {
    return this.querySelector<LuiCheckbox>(
      ':scope > table > thead lui-checkbox'
    );
  }

  // Disabled rows stay out of the selection: select all cannot change them, and
  // they do not count toward "all selected".
  private get _rowCheckboxes(): LuiCheckbox[] {
    return [
      ...this.querySelectorAll<LuiCheckbox>(
        ':scope > table > tbody lui-checkbox'
      ),
    ].filter((box) => !box.disabled);
  }

  private _syncHead() {
    const head = this._headCheckbox;
    const rows = this._rowCheckboxes;
    if (!head) return;
    const count = rows.filter((box) => box.checked).length;
    head.checked = rows.length > 0 && count === rows.length;
    head.indeterminate = count > 0 && count < rows.length;
  }

  private _handleChange = (event: Event) => {
    if (!this.selectable) return;
    const target = event.target as LuiCheckbox;
    const head = this._headCheckbox;

    if (target === head) {
      this._rowCheckboxes.forEach((box) => (box.checked = head.checked));
    } else if (!this._rowCheckboxes.includes(target)) {
      return;
    }
    this._syncHead();

    const selected = this._rowCheckboxes.filter((box) => box.checked);
    this._announcement = this.selectionLabel
      .replace('{count}', String(selected.length))
      .replace('{total}', String(this._rowCheckboxes.length));
    this.dispatchEvent(
      new CustomEvent('lui-selection-change', {
        bubbles: true,
        composed: true,
        detail: {
          rows: selected.map((box) => box.closest('tr')),
          count: selected.length,
          total: this._rowCheckboxes.length,
        },
      })
    );
  };

  private _measure() {
    const table = this._table;
    const wrapper =
      this.renderRoot.querySelector<HTMLElement>('.table-wrapper');
    if (!table || !wrapper) return;
    this._scrollable = table.scrollWidth > wrapper.clientWidth;
  }

  private _handleSlotChange() {
    const table = this._table;
    if (!table) return;
    table.classList.add('table');
    this._tableName =
      table.getAttribute('aria-label') ??
      table.caption?.textContent?.trim() ??
      '';
    this._resizeObserver?.observe(table);
    this._measure();
    if (this.selectable) {
      customElements.whenDefined('lui-checkbox').then(() => this._syncHead());
    }
  }

  render() {
    const scrollable = this._scrollable;
    const name = this.label || this._tableName || undefined;

    return html`
      <div
        class="table-wrapper ${this.bordered ? 'table-wrapper--bordered' : ''}"
        role="${ifDefined(scrollable ? 'region' : undefined)}"
        tabindex="${ifDefined(scrollable ? '0' : undefined)}"
        aria-label="${ifDefined(scrollable ? name : undefined)}"
      >
        <slot @slotchange="${this._handleSlotChange}"></slot>
      </div>
      <div class="table-status" role="status" aria-live="polite">
        ${this._announcement}
      </div>
    `;
  }
}
