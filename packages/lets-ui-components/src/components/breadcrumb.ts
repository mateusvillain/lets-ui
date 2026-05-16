import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './breadcrumb.scss?inline';

export class LuiBreadcrumb extends LitElement {
  static styles = unsafeCSS(styles);

  @property() items = 'Item 1,Item 2,Item 3';
  @property() label = 'Page';
  @property({ attribute: 'aria-label' }) ariaLabel = 'Breadcrumb';

  @state() private _slottedItems: Array<{
    label: string;
    href: string | null;
    active: boolean;
  }> = [];

  private _handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const els = slot
      .assignedElements()
      .filter((el) => el.tagName.toLowerCase() === 'lui-breadcrumb-item');
    this._slottedItems = els.map((el) => ({
      label: el.innerHTML.trim(),
      href: el.getAttribute('href'),
      active:
        el.hasAttribute('active') && el.getAttribute('active') !== 'false',
    }));
  }

  render() {
    if (this._slottedItems.length > 0) {
      return html`
        <nav aria-label="${this.ariaLabel}">
          <ul class="breadcrumb" role="list">
            ${this._slottedItems.map((item) => {
              if (!item.active && item.href) {
                return html`<li>
                  <a
                    class="link"
                    href="${item.href}"
                    .innerHTML="${item.label}"
                  ></a>
                </li>`;
              }
              if (item.active) {
                return html`<li
                  aria-current="page"
                  .innerHTML="${item.label}"
                ></li>`;
              }
              return html`<li .innerHTML="${item.label}"></li>`;
            })}
          </ul>
        </nav>
        <slot
          style="display:none"
          @slotchange="${this._handleSlotChange}"
        ></slot>
      `;
    }

    const parsedItems = this.items
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    return html`
      <nav aria-label="${this.ariaLabel}">
        <ul class="breadcrumb" role="list">
          ${parsedItems.map(
            (item) => html`<li><a class="link">${item}</a></li>`
          )}
          <li aria-current="page">${this.label}</li>
        </ul>
      </nav>
      <slot style="display:none" @slotchange="${this._handleSlotChange}"></slot>
    `;
  }
}
