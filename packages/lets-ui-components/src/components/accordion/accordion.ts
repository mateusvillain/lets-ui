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
    this.addEventListener('keydown', this._handleKeydown);
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
    // lui-toggle is composed and bubbles: ignore items of a nested accordion.
    if (!this._items.includes(e.target as LuiAccordionItem)) return;
    this._items.forEach((item) => {
      if (item !== e.target && item.open) item.open = false;
    });
  };

  // Arrow keys, Home and End move focus between the headers, skipping disabled
  // items. Only a keydown on a trigger counts: the same keys inside an open
  // panel — a text field, say — belong to the content.
  private _handleKeydown = (e: KeyboardEvent) => {
    // Alt+Arrow, Ctrl+Home and the like belong to the browser and assistive
    // technology, not to the roving focus.
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    const trigger = e.composedPath()[0] as HTMLElement;
    if (!trigger.classList?.contains('accordion__trigger')) return;

    const items = this._items.filter((item) => !item.disabled);
    const current = items.findIndex((item) =>
      item.shadowRoot?.contains(trigger)
    );
    if (current === -1) return;

    let next: number;
    switch (e.key) {
      case 'ArrowDown':
        next = (current + 1) % items.length;
        break;
      case 'ArrowUp':
        next = (current - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    items[next].focus();
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
