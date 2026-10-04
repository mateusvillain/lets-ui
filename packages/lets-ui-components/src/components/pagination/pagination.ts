import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './pagination.scss?inline';

type PageItem = number | 'start-ellipsis' | 'end-ellipsis';
type FocusTarget = 'previous' | 'next' | 'current';

const CHEVRON_LEFT = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="20"
  height="20"
  fill="currentColor"
  viewBox="0 0 20 20"
  aria-hidden="true"
>
  <path
    d="M11.589 4.558a.625.625 0 0 1 .884.884L7.915 10l4.558 4.558a.625.625 0 0 1-.884.884l-5-5a.625.625 0 0 1 0-.884l5-5Z"
  />
</svg>`;

const CHEVRON_RIGHT = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="20"
  height="20"
  fill="currentColor"
  viewBox="0 0 20 20"
  aria-hidden="true"
>
  <path
    d="M8.411 4.558a.625.625 0 0 0-.884.884L12.085 10l-4.558 4.558a.625.625 0 0 0 .884.884l5-5a.625.625 0 0 0 0-.884l-5-5Z"
  />
</svg>`;

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// The first and last pages are always shown, the current page keeps
// `siblings` neighbours on each side, and an ellipsis stands in for every gap.
// The list always has the same length once it truncates — first, last,
// current, its siblings and two slots that are either an ellipsis or the page
// next to the boundary — so the row does not change width while paging.
export function paginationItems(
  current: number,
  total: number,
  siblings: number
): PageItem[] {
  if (total <= siblings * 2 + 5) return range(1, total);

  const start = Math.max(
    Math.min(current - siblings, total - siblings * 2 - 2),
    3
  );
  const end = Math.min(
    Math.max(current + siblings, siblings * 2 + 3),
    total - 2
  );

  return [
    1,
    start > 3 ? 'start-ellipsis' : 2,
    ...range(start, end),
    end < total - 2 ? 'end-ellipsis' : total - 1,
    total,
  ];
}

export class LuiPagination extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Number, attribute: 'current-page', reflect: true })
  currentPage = 1;
  @property({ type: Number, attribute: 'total-pages' }) totalPages = 1;
  @property({ type: Number, attribute: 'sibling-count' }) siblingCount = 1;
  @property({ attribute: 'aria-label' }) ariaLabel = 'Pagination';
  @property({ attribute: 'previous-label' }) previousLabel = 'Previous page';
  @property({ attribute: 'next-label' }) nextLabel = 'Next page';

  // Which control should hold focus once the new page has rendered. Lit reuses
  // the buttons by position, so without this the focus would stay on whatever
  // page now occupies the slot that was clicked — or be lost when that slot
  // becomes an ellipsis or a disabled arrow.
  private _focusTarget: FocusTarget | null = null;

  get _total(): number {
    return Math.max(1, Math.floor(this.totalPages) || 1);
  }

  get _current(): number {
    return Math.min(
      Math.max(1, Math.floor(this.currentPage) || 1),
      this._total
    );
  }

  get _siblings(): number {
    return Math.max(0, Math.floor(this.siblingCount) || 0);
  }

  private _goTo(page: number, focusTarget: FocusTarget) {
    const target = Math.min(Math.max(1, page), this._total);
    if (target === this._current) return;

    this.currentPage = target;
    this._focusTarget = focusTarget;

    this.dispatchEvent(
      new CustomEvent('lui-page-change', {
        bubbles: true,
        composed: true,
        detail: { page: target },
      })
    );
  }

  updated() {
    if (!this._focusTarget) return;

    const root = this.shadowRoot;
    let el = root?.querySelector<HTMLButtonElement>(
      `[data-control="${this._focusTarget}"]`
    );
    if (!el || el.disabled) {
      el = root?.querySelector<HTMLButtonElement>('[aria-current="page"]');
    }
    el?.focus();
    this._focusTarget = null;
  }

  private _renderItem(item: PageItem) {
    if (typeof item !== 'number') {
      return html`<li aria-hidden="true">
        <span class="pagination__ellipsis">…</span>
      </li>`;
    }

    const isCurrent = item === this._current;
    return html`<li>
      <button
        class="pagination__item"
        type="button"
        aria-current="${ifDefined(isCurrent ? 'page' : undefined)}"
        data-control="${ifDefined(isCurrent ? 'current' : undefined)}"
        @click="${() => this._goTo(item, 'current')}"
      >
        ${item}
      </button>
    </li>`;
  }

  render() {
    const current = this._current;
    const total = this._total;
    const isFirst = current === 1;
    const isLast = current === total;

    return html`
      <nav class="pagination" aria-label="${this.ariaLabel}">
        <ul class="pagination__list">
          <li>
            <button
              class="pagination__item pagination__item--direction"
              type="button"
              data-control="previous"
              aria-label="${this.previousLabel}"
              ?disabled="${isFirst}"
              aria-disabled="${ifDefined(isFirst ? 'true' : undefined)}"
              @click="${() => this._goTo(current - 1, 'previous')}"
            >
              ${CHEVRON_LEFT}
            </button>
          </li>
          ${paginationItems(current, total, this._siblings).map((item) =>
            this._renderItem(item)
          )}
          <li>
            <button
              class="pagination__item pagination__item--direction"
              type="button"
              data-control="next"
              aria-label="${this.nextLabel}"
              ?disabled="${isLast}"
              aria-disabled="${ifDefined(isLast ? 'true' : undefined)}"
              @click="${() => this._goTo(current + 1, 'next')}"
            >
              ${CHEVRON_RIGHT}
            </button>
          </li>
        </ul>
      </nav>
    `;
  }
}
