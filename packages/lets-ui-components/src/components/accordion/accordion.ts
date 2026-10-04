import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './accordion.scss?inline';
import type { LuiAccordionItem } from './accordion-item.js';

export class LuiAccordion extends LitElement {
  static styles = unsafeCSS(styles);

  @property() variant = 'default';
  @property({ type: Boolean }) multiple = false;
  @property({ type: Number, attribute: 'heading-level' }) headingLevel = 3;

  constructor() {
    super();
    this.addEventListener('lui-toggle', this._handleToggle as EventListener);
  }

  get _variant(): 'default' | 'bordered' | 'highlighted' {
    return this.variant === 'bordered' || this.variant === 'highlighted'
      ? this.variant
      : 'default';
  }

  private get _items(): LuiAccordionItem[] {
    return Array.from(this.children).filter(
      (el): el is LuiAccordionItem =>
        el.tagName.toLowerCase() === 'lui-accordion-item'
    );
  }

  // In single-open mode only one item may start open: the first one wins.
  private _enforceSingleOpen() {
    if (this.multiple) return;
    this._items
      .filter((item) => item.open)
      .slice(1)
      .forEach((item) => {
        item.open = false;
      });
  }

  private _handleToggle = (e: CustomEvent<{ open: boolean }>) => {
    if (this.multiple || !e.detail.open) return;
    this._items.forEach((item) => {
      if (item !== e.target && item.open) item.open = false;
    });
  };

  private _syncItems() {
    this._items.forEach((item) => {
      item.inheritedHeadingLevel = this.headingLevel;
    });
    this._enforceSingleOpen();
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('headingLevel') || changed.has('multiple')) {
      this._syncItems();
    }
  }

  render() {
    return html`
      <div class="accordion accordion--${this._variant}">
        <slot @slotchange="${this._syncItems}"></slot>
      </div>
    `;
  }
}
