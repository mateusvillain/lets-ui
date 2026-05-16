import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './tabs.scss?inline';

interface TabData {
  label: string;
  disabled: boolean;
  active: boolean;
  content: string;
}

export class LuiTabs extends LitElement {
  static styles = unsafeCSS(styles);

  @property() variant = 'line';
  @property({ type: Boolean }) expand = false;

  @state() private _tabs: TabData[] = [];

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-tabs-${Math.random().toString(36).slice(2, 9)}`;
  }

  get _variant(): 'line' | 'card' {
    return this.variant === 'card' ? 'card' : 'line';
  }

  private _handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const tabEls = slot
      .assignedElements()
      .filter((el) => el.tagName.toLowerCase() === 'lui-tab');

    const tabs: TabData[] = tabEls.map((el) => ({
      label: el.getAttribute('label') ?? '',
      disabled:
        el.hasAttribute('disabled') && el.getAttribute('disabled') !== 'false',
      active:
        el.hasAttribute('active') && el.getAttribute('active') !== 'false',
      content: el.innerHTML,
    }));

    if (tabs.length > 0 && !tabs.some((t) => t.active && !t.disabled)) {
      const first = tabs.find((t) => !t.disabled);
      if (first) first.active = true;
    }

    this._tabs = tabs;
  }

  private _activateTab(index: number) {
    const tabs = [...this._tabs];
    if (!tabs[index] || tabs[index].disabled) return;

    tabs.forEach((t, i) => {
      t.active = i === index;
    });
    this._tabs = tabs;

    this.dispatchEvent(
      new CustomEvent('tab-change', {
        bubbles: true,
        composed: true,
        detail: { index, label: tabs[index].label },
      })
    );
  }

  private _handleTabListClick(e: MouseEvent) {
    const tab = (e.target as HTMLElement).closest(
      '[role="tab"]'
    ) as HTMLElement | null;
    if (!tab) return;
    const tabList = this.shadowRoot?.querySelector('[role="tablist"]');
    const allTabs = Array.from(
      tabList?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []
    );
    this._activateTab(allTabs.indexOf(tab));
  }

  private _handleTabListKeydown(e: KeyboardEvent) {
    const tabList = this.shadowRoot?.querySelector('[role="tablist"]');
    const allTabs = Array.from(
      tabList?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []
    );
    const currentIndex = allTabs.indexOf(
      this.shadowRoot?.activeElement as HTMLElement
    );
    if (currentIndex === -1) return;

    const isEnabled = (el: HTMLElement) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-disabled') !== 'true';

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (isEnabled(allTabs[i])) {
            this._activateTab(i);
            break;
          }
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        for (let i = currentIndex + 1; i < allTabs.length; i++) {
          if (isEnabled(allTabs[i])) {
            this._activateTab(i);
            break;
          }
        }
        break;
      case 'Home':
        e.preventDefault();
        {
          const first = allTabs.findIndex(isEnabled);
          if (first !== -1) this._activateTab(first);
        }
        break;
      case 'End':
        e.preventDefault();
        for (let i = allTabs.length - 1; i >= 0; i--) {
          if (isEnabled(allTabs[i])) {
            this._activateTab(i);
            break;
          }
        }
        break;
    }
  }

  updated() {
    // Focus the active tab after update
    const tabList = this.shadowRoot?.querySelector('[role="tablist"]');
    const allTabs = Array.from(
      tabList?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []
    );
    const activeIndex = this._tabs.findIndex((t) => t.active);
    if (
      activeIndex !== -1 &&
      allTabs[activeIndex] &&
      document.activeElement === this
    ) {
      allTabs[activeIndex].focus();
    }
  }

  render() {
    const variant = this._variant;
    const listClass = ['tabs__list', this.expand ? 'tabs__list--expand' : '']
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="tabs tabs--${variant}">
        <div
          class="${listClass}"
          role="tablist"
          @click="${this._handleTabListClick}"
          @keydown="${this._handleTabListKeydown}"
        >
          ${this._tabs.map(
            (tab, i) => html`
              <button
                id="${this._baseId}-tab-${i}"
                class="tab"
                role="tab"
                type="button"
                aria-selected="${tab.active ? 'true' : 'false'}"
                aria-controls="${this._baseId}-panel-${i}"
                tabindex="${tab.active ? '0' : '-1'}"
                ?disabled="${tab.disabled}"
                ?aria-disabled="${tab.disabled}"
              >
                ${tab.label}
              </button>
            `
          )}
        </div>
        ${this._tabs.map(
          (tab, i) => html`
            <div
              id="${this._baseId}-panel-${i}"
              class="tabs__panel"
              role="tabpanel"
              aria-labelledby="${this._baseId}-tab-${i}"
              ?hidden="${!tab.active}"
              .innerHTML="${tab.content}"
            ></div>
          `
        )}
      </div>
      <slot style="display:none" @slotchange="${this._handleSlotChange}"></slot>
    `;
  }
}

export class LuiTab extends LitElement {}
