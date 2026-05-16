import { LitElement, html, unsafeCSS } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import styles from './dropdown-menu.scss?inline';

const CHEVRON_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" focusable="false" aria-hidden="true"><path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const FOCUSABLE_SELECTOR =
  'button, [href], input, [tabindex]:not([tabindex="-1"]), lui-button, lui-icon-button';

const DIVIDER_TAGS = new Set(['lui-divider', 'lui-menu-divider']);
const ITEM_TAGS = new Set(['lui-menu-item', ...DIVIDER_TAGS]);

interface MenuItemData {
  label: string;
  shortcut: string;
  disabled: boolean;
  variant: string;
  children: Element[];
}

function buildShortcutHtml(shortcut: string): string {
  const keys = shortcut
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  if (keys.length === 0) return '';
  const keysHtml = keys
    .map((key, i) => {
      const sep =
        i < keys.length - 1
          ? `<span class="shortcut__sep" aria-hidden="true">+</span>`
          : '';
      return `<kbd class="shortcut__key">${key}</kbd>${sep}`;
    })
    .join('');
  return `<span class="menu-item__shortcut shortcut" aria-label="${keys.join(' + ')}" role="group">${keysHtml}</span>`;
}

function buildItemsHtml(items: Element[]): string {
  return Array.from(items)
    .filter((child) => ITEM_TAGS.has(child.tagName?.toLowerCase()))
    .map((child) => {
      if (DIVIDER_TAGS.has(child.tagName.toLowerCase())) {
        return `<li role="separator" class="divider"></li>`;
      }
      const label = child.getAttribute('label') ?? '';
      const shortcut = child.getAttribute('shortcut') ?? '';
      const disabled =
        child.hasAttribute('disabled') &&
        child.getAttribute('disabled') !== 'false';
      const variant = child.getAttribute('variant') ?? '';
      const submenuChildren = Array.from(child.children).filter((c) =>
        ITEM_TAGS.has(c.tagName.toLowerCase())
      );
      const hasSubmenu = submenuChildren.length > 0;
      const itemClasses = [
        'menu-item',
        variant === 'danger' ? 'menu-item--danger' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const shortcutHtml = shortcut ? buildShortcutHtml(shortcut) : '';
      const chevronHtml = hasSubmenu
        ? `<span class="menu-item__chevron" aria-hidden="true">${CHEVRON_RIGHT}</span>`
        : '';
      const submenuHtml = hasSubmenu
        ? `<ul class="dropdown-menu__panel" role="menu">${buildItemsHtml(Array.from(child.children))}</ul>`
        : '';
      return `
        <li role="presentation"${hasSubmenu ? ' class="menu-item--has-submenu"' : ''}>
          <button
            class="${itemClasses}"
            role="menuitem"
            type="button"
            ${disabled ? 'disabled aria-disabled="true"' : ''}
            ${hasSubmenu ? 'aria-haspopup="menu" aria-expanded="false"' : ''}
          >
            <span class="menu-item__label">${label}</span>
            ${shortcutHtml}
            ${chevronHtml}
          </button>
          ${submenuHtml}
        </li>
      `;
    })
    .join('');
}

export class LuiDropdownMenu extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true }) open = false;

  @query('[data-dropdown-panel]') private _panel!: HTMLElement;

  @state() private _itemsHtml = '';
  @state() private _hasTriggerSlot = false;

  private _baseId: string;
  private _handleDocumentClick!: (e: MouseEvent) => void;
  private _handleDocumentKeydown!: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this._baseId = `lui-dropdown-menu-${Math.random().toString(36).slice(2, 9)}`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleDocumentClick = (event: MouseEvent) => {
      if (
        !this.contains(event.target as Node) &&
        !this.shadowRoot?.contains(event.target as Node)
      ) {
        this.closeMenu();
      }
    };
    this._handleDocumentKeydown = (event: KeyboardEvent) => {
      if (!this.open) return;
      if (event.key === 'Escape') {
        this.closeMenu();
        this._focusTrigger();
      }
    };
    document.addEventListener('click', this._handleDocumentClick);
    document.addEventListener('keydown', this._handleDocumentKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleDocumentClick);
    document.removeEventListener('keydown', this._handleDocumentKeydown);
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('open')) {
      this._syncOpenState();
    }
  }

  openMenu() {
    this.open = true;
  }

  closeMenu() {
    this.open = false;
  }

  toggleMenu() {
    this.open = !this.open;
  }

  private _syncOpenState() {
    const panel = this._panel;
    if (!panel) return;
    panel.classList.toggle('is-open', this.open);

    if (this.open) {
      requestAnimationFrame(() => {
        const first = panel.querySelector<HTMLElement>(
          '.dropdown-menu__panel > li > .menu-item:not([disabled]):not([aria-disabled="true"])'
        );
        first?.focus();
      });
    }
  }

  private _focusTrigger() {
    const wrapper = this.shadowRoot?.querySelector(
      '[data-dropdown-trigger]'
    ) as HTMLElement | null;
    const focusable = wrapper?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable || wrapper)?.focus();
  }

  private _handleTriggerSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._hasTriggerSlot = slot.assignedNodes({ flatten: true }).length > 0;
  }

  private _handleItemsSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const itemEls = slot
      .assignedElements()
      .filter((el) => ITEM_TAGS.has(el.tagName.toLowerCase()));
    this._itemsHtml = buildItemsHtml(itemEls);
    this.requestUpdate();
  }

  private _handlePanelClick(e: MouseEvent) {
    const item = (e.target as HTMLElement).closest(
      '.menu-item'
    ) as HTMLElement | null;
    if (!item) return;
    const li = item.parentElement;
    if (li?.classList.contains('menu-item--has-submenu')) return;
    const label = item.querySelector('.menu-item__label')?.textContent?.trim();
    this.dispatchEvent(
      new CustomEvent('menu-select', {
        bubbles: true,
        composed: true,
        detail: { label },
      })
    );
    this.closeMenu();
  }

  private _handlePanelKeydown(e: KeyboardEvent) {
    const activePanel = (e.target as HTMLElement).closest(
      '.dropdown-menu__panel'
    ) as HTMLElement | null;
    if (!activePanel) return;

    const items = Array.from(
      activePanel.querySelectorAll<HTMLElement>(
        ':scope > li > .menu-item:not([disabled]):not([aria-disabled="true"])'
      )
    );
    const focused = (e.target as HTMLElement).closest(
      '.menu-item'
    ) as HTMLElement | null;
    const currentIndex = focused ? items.indexOf(focused) : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        items[(currentIndex + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        break;
      case 'ArrowRight': {
        const li = focused?.parentElement;
        if (li?.classList.contains('menu-item--has-submenu')) {
          e.preventDefault();
          const submenuPanel = li.querySelector<HTMLElement>(
            ':scope > .dropdown-menu__panel'
          );
          const firstItem = submenuPanel?.querySelector<HTMLElement>(
            '.menu-item:not([disabled]):not([aria-disabled="true"])'
          );
          firstItem?.focus();
        }
        break;
      }
      case 'ArrowLeft': {
        const parentLi = activePanel.closest(
          '.menu-item--has-submenu'
        ) as HTMLElement | null;
        if (parentLi) {
          e.preventDefault();
          parentLi.querySelector<HTMLElement>(':scope > .menu-item')?.focus();
        }
        break;
      }
      case 'Tab':
        this.closeMenu();
        break;
    }
  }

  render() {
    return html`
      <div class="dropdown-menu">
        <span
          class="dropdown-menu__trigger"
          data-dropdown-trigger
          @click="${this._handleTriggerClick}"
        >
          <slot
            name="trigger"
            @slotchange="${this._handleTriggerSlotChange}"
          ></slot>
        </span>
        <ul
          id="${this._baseId}-panel"
          class="dropdown-menu__panel${this.open ? ' is-open' : ''}"
          role="menu"
          data-dropdown-panel
          @click="${this._handlePanelClick}"
          @keydown="${this._handlePanelKeydown}"
          .innerHTML="${this._itemsHtml}"
        ></ul>
      </div>
      <slot
        name="items"
        style="display:none"
        @slotchange="${this._handleItemsSlotChange}"
      ></slot>
    `;
  }

  private _handleTriggerClick(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('[disabled], [aria-disabled="true"]'))
      return;
    this.toggleMenu();
  }
}

export class LuiMenuItem extends LitElement {}
export class LuiMenuDivider extends LitElement {}
