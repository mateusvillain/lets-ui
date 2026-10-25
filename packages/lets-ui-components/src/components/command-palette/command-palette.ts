import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { DialogStackController } from '../../utils/dialog-stack.js';
import { FOCUSABLE } from '../../utils/dialog-trigger.js';
import { FocusReturnController } from '../../utils/focus-return.js';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scroll-lock.js';
import styles from './command-palette.scss?inline';

const ICON_SEARCH = html`
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.75"></circle>
    <path d="M15.3 15.3L20.25 20.25"></path>
  </svg>
`;

const ICON_CLEAR = html`
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path d="M6 6L18 18"></path>
    <path d="M18 6L6 18"></path>
  </svg>
`;

// Key glyphs for the keyboard legend, from Let's UI Icons (arrow-up,
// arrow-down, arrow-elbow-down-left).
const KEY_UP = html`
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    focusable="false"
    aria-hidden="true"
  >
    <path
      d="M11.5264,3.9179C11.821,3.6777,12.2557,3.6951,12.5303,3.9697L17.7803,9.2197C18.0732,9.5126,18.0731,9.9873,17.7803,10.2802C17.4874,10.5731,17.0127,10.5731,16.7198,10.2802L12.75,6.3105L12.75,19.5C12.75,19.9142,12.4142,20.25,12,20.25C11.5858,20.25,11.25,19.9142,11.25,19.5L11.25,6.3105L7.2803,10.2802C6.9874,10.5731,6.5126,10.5731,6.2197,10.2802C5.9268,9.9873,5.9268,9.5126,6.2197,9.2197L11.4697,3.9697L11.5264,3.9179Z"
    />
  </svg>
`;

const KEY_DOWN = html`
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    focusable="false"
    aria-hidden="true"
  >
    <path
      d="M12,3.75C12.4142,3.75,12.75,4.0858,12.75,4.5L12.75,17.6895L16.7197,13.7197C17.0126,13.4269,17.4874,13.4269,17.7803,13.7197C18.0732,14.0126,18.0732,14.4874,17.7803,14.7803L12.5303,20.0303C12.2374,20.3232,11.7626,20.3232,11.4697,20.0303L6.2197,14.7803C5.9268,14.4874,5.9268,14.0126,6.2197,13.7197C6.5126,13.4269,6.9874,13.4269,7.2803,13.7197L11.25,17.6895L11.25,4.5C11.25,4.0858,11.5858,3.75,12,3.75Z"
    />
  </svg>
`;

const KEY_ENTER = html`
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    focusable="false"
    aria-hidden="true"
  >
    <path
      d="M20.25,3.75L20.25,16.5C20.25,16.9142,19.9142,17.25,19.5,17.25L3.75,17.25M6.75,20.25L3.75,17.25L6.75,14.25"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

interface ItemData {
  id: string;
  value: string;
  label: string;
  caption: string;
  description: string;
  shortcut: string;
  avatar: string;
  avatarSrc: string;
  tag: string;
  keywords: string;
  icon: Node | null;
  source: Element;
}

interface GroupData {
  id: string;
  label: string;
  items: ItemData[];
}

interface TagData {
  value: string;
  label: string;
}

// Case and accents do not count: "calendario" finds "Calendário".
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export class LuiCommandPalette extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true }) open = false;
  @property() placeholder = 'Search actions or files';
  @property() label = 'Command palette';
  @property({ attribute: 'empty-text' }) emptyText = 'No results found';
  @property({ attribute: 'results-label' }) resultsLabel = '{count} results';
  @property({ attribute: 'clear-label' }) clearLabel = 'Clear search';
  @property({ attribute: 'tags-label' }) tagsLabel = 'Filter results';
  @property({ attribute: 'navigate-label' }) navigateLabel = 'Navigate';
  @property({ attribute: 'select-label' }) selectLabel = 'Select';
  @property({ attribute: 'close-label' }) closeLabel = 'Close';
  /** Leaves ⌘K / Ctrl+K alone, for a page that opens the palette itself. */
  @property({ attribute: 'no-hotkey', type: Boolean }) noHotkey = false;
  /** Shows every item whatever the query, for results filtered elsewhere. */
  @property({ attribute: 'no-filter', type: Boolean }) noFilter = false;

  @state() private _query = '';
  @state() private _tag = '';
  @state() private _activeIndex = 0;
  @state() private _groups: GroupData[] = [];
  @state() private _tags: TagData[] = [];

  @query('[data-palette-dialog]') private _dialog!: HTMLElement;
  @query('[data-palette-backdrop]') private _backdrop!: HTMLElement;
  @query('[data-palette-input]') private _input!: HTMLInputElement;

  private _baseId = `lui-command-palette-${Math.random().toString(36).slice(2, 9)}`;
  // The host's own attributes (`open`, the labels) are not item data.
  private _observer = new MutationObserver((records) => {
    const isItemData = (record: MutationRecord) =>
      record.type !== 'attributes' || record.target !== this;
    if (records.some(isItemData)) this._readChildren();
  });
  private _visibleGroups: GroupData[] = [];
  private _visible: ItemData[] = [];

  constructor() {
    super();
    // No trigger of its own: with no opener to go back to, focus is left
    // where the closing put it.
    new FocusReturnController(this, () => null);
    new DialogStackController(this, {
      escape: () => this.hide(),
      tab: (event) => this._trapFocus(event),
    });
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleHotkey);
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
    this._readChildren();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleHotkey);
    this._observer.disconnect();
    if (this.open) unlockBodyScroll();
  }

  show() {
    this.open = true;
  }

  hide() {
    this.open = false;
  }

  toggle() {
    this.open = !this.open;
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('open') && this.open) {
      // Every opening starts a new search.
      this._query = '';
      this._activeIndex = 0;
    }
    this._visibleGroups = this._groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => this._matches(item)),
      }))
      .filter((group) => group.items.length > 0);
    this._visible = this._visibleGroups.flatMap((group) => group.items);
    // Results shrank under the highlight: back to the first one.
    if (this._activeIndex >= this._visible.length) this._activeIndex = 0;
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('open')) {
      const wasOpen = changed.get('open') === true;
      if (this.open && !wasOpen) {
        lockBodyScroll();
        requestAnimationFrame(() => {
          // Closed again before this frame: focus has already gone back.
          if (this.open) this._input?.focus();
        });
      }
      if (!this.open && wasOpen) unlockBodyScroll();
    }
    if (changed.has('_activeIndex') || changed.has('_query')) {
      this.shadowRoot
        ?.querySelector('[role="option"].is-active')
        ?.scrollIntoView({ block: 'nearest' });
    }
  }

  // The first palette on the page takes the shortcut; the rest see it handled.
  private _handleHotkey = (event: KeyboardEvent) => {
    if (this.noHotkey || event.defaultPrevented) return;
    if (event.altKey || event.shiftKey) return;
    if (!(event.metaKey || event.ctrlKey)) return;
    if (event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    this.toggle();
  };

  private _readChildren() {
    let count = 0;
    const toItem = (el: Element): ItemData => {
      const label = el.getAttribute('label') ?? el.textContent?.trim() ?? '';
      const icon = el.querySelector(':scope > [slot="icon"]');
      const clone = icon?.cloneNode(true) as Element | undefined;
      clone?.removeAttribute('slot');
      return {
        id: `${this._baseId}-option-${count++}`,
        value: el.getAttribute('value') ?? label,
        label,
        caption: el.getAttribute('caption') ?? '',
        description: el.getAttribute('description') ?? '',
        shortcut: el.getAttribute('shortcut') ?? '',
        avatar: el.getAttribute('avatar') ?? '',
        avatarSrc: el.getAttribute('avatar-src') ?? '',
        tag: el.getAttribute('tag') ?? '',
        keywords: el.getAttribute('keywords') ?? '',
        icon: clone ?? null,
        source: el,
      };
    };

    const groups: GroupData[] = [];
    const tags: TagData[] = [];
    let loose: GroupData | null = null;

    for (const child of Array.from(this.children)) {
      const tagName = child.tagName.toLowerCase();
      if (tagName === 'lui-command-tag') {
        const label =
          child.getAttribute('label') ?? child.textContent?.trim() ?? '';
        tags.push({ value: child.getAttribute('value') ?? label, label });
      } else if (tagName === 'lui-command-group') {
        loose = null;
        groups.push({
          id: `${this._baseId}-group-${groups.length}`,
          label: child.getAttribute('label') ?? '',
          items: Array.from(child.children)
            .filter((el) => el.tagName.toLowerCase() === 'lui-command-item')
            .map(toItem),
        });
      } else if (tagName === 'lui-command-item') {
        // Items outside a group share an unlabelled one, in document order.
        if (!loose) {
          loose = {
            id: `${this._baseId}-group-${groups.length}`,
            label: '',
            items: [],
          };
          groups.push(loose);
        }
        loose.items.push(toItem(child));
      }
    }

    this._groups = groups;
    this._tags = tags;
    if (this._tag && !tags.some((t) => t.value === this._tag)) this._tag = '';
  }

  private _matches(item: ItemData): boolean {
    if (this._tag && item.tag !== this._tag) return false;
    if (this.noFilter) return true;
    const query = normalize(this._query.trim());
    if (!query) return true;
    return normalize(
      [item.label, item.caption, item.description, item.keywords].join(' ')
    ).includes(query);
  }

  private _activate(item: ItemData | undefined) {
    if (!item) return;
    const event = new CustomEvent('lui-select', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { value: item.value, label: item.label, item: item.source },
    });
    // A listener that cancels keeps the palette open (a nested step, say).
    if (this.dispatchEvent(event)) this.hide();
  }

  private _handleInput(event: Event) {
    this._query = (event.target as HTMLInputElement).value;
    this._activeIndex = 0;
    this.dispatchEvent(
      new CustomEvent('lui-search', {
        bubbles: true,
        composed: true,
        detail: { query: this._query },
      })
    );
  }

  private _handleInputKeydown(event: KeyboardEvent) {
    const count = this._visible.length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (count) this._activeIndex = (this._activeIndex + 1) % count;
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (count) this._activeIndex = (this._activeIndex - 1 + count) % count;
        break;
      case 'Enter':
        if (event.isComposing) return;
        event.preventDefault();
        this._activate(this._visible[this._activeIndex]);
        break;
    }
  }

  private _clear() {
    this._query = '';
    this._activeIndex = 0;
    this._input.focus();
    this.dispatchEvent(
      new CustomEvent('lui-search', {
        bubbles: true,
        composed: true,
        detail: { query: '' },
      })
    );
  }

  private _toggleTag(value: string) {
    this._tag = this._tag === value ? '' : value;
    this._activeIndex = 0;
  }

  private _trapFocus(event: KeyboardEvent) {
    const dialog = this._dialog;
    if (!dialog) return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE)
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = this.shadowRoot?.activeElement;

    // Focus outside the dialog (the page behind it) is brought back in.
    if (!current || !focusable.includes(current as HTMLElement)) {
      event.preventDefault();
      first.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    }
  }

  private _handleBackdropClick(event: MouseEvent) {
    if (event.target === this._backdrop) this.hide();
  }

  private _renderItem(item: ItemData, index: number) {
    const active = index === this._activeIndex;
    const describedBy = [
      item.caption && `${item.id}-caption`,
      item.description && `${item.id}-description`,
    ]
      .filter(Boolean)
      .join(' ');
    const leading =
      item.avatar || item.avatarSrc
        ? html`<lui-avatar
            size="sm"
            name="${item.avatar}"
            src="${item.avatarSrc}"
          ></lui-avatar>`
        : item.icon;

    return html`
      <div
        id="${item.id}"
        class="command-palette__item${active ? ' is-active' : ''}"
        role="option"
        aria-selected="${active ? 'true' : 'false'}"
        aria-labelledby="${item.id}-label"
        aria-describedby="${describedBy || nothing}"
        @mousedown="${(e: MouseEvent) => e.preventDefault()}"
        @mousemove="${() => {
          if (this._activeIndex !== index) this._activeIndex = index;
        }}"
        @click="${() => this._activate(item)}"
      >
        ${leading
          ? html`<span class="command-palette__leading" aria-hidden="true"
              >${leading}</span
            >`
          : nothing}
        <span class="command-palette__text">
          <span class="command-palette__title-row">
            <span id="${item.id}-label" class="command-palette__title"
              >${item.label}</span
            >
            ${item.caption
              ? html`<span
                  id="${item.id}-caption"
                  class="command-palette__caption"
                  >${item.caption}</span
                >`
              : nothing}
          </span>
          ${item.description
            ? html`<span
                id="${item.id}-description"
                class="command-palette__description"
                >${item.description}</span
              >`
            : nothing}
        </span>
        ${item.shortcut
          ? html`<lui-shortcut
              class="command-palette__shortcut"
              keys="${item.shortcut}"
              aria-hidden="true"
            ></lui-shortcut>`
          : nothing}
      </div>
    `;
  }

  private _renderResults(groups: GroupData[]) {
    let index = 0;
    return groups.map(
      (group, g) => html`
        ${g > 0
          ? html`<div class="command-palette__separator" aria-hidden="true">
              <lui-divider></lui-divider>
            </div>`
          : nothing}
        <div
          role="group"
          aria-labelledby="${group.label ? `${group.id}-label` : nothing}"
        >
          ${group.label
            ? html`<div
                id="${group.id}-label"
                class="command-palette__group-label"
              >
                ${group.label}
              </div>`
            : nothing}
          ${group.items.map((item) => this._renderItem(item, index++))}
        </div>
      `
    );
  }

  render() {
    const count = this._visible.length;
    const active = this._visible[this._activeIndex];
    const listboxId = `${this._baseId}-listbox`;

    return html`
      <div
        class="command-palette__backdrop"
        data-palette-backdrop
        style="${this.open ? '' : 'display:none'}"
        @click="${this._handleBackdropClick}"
      >
        <div
          class="command-palette__dialog"
          data-palette-dialog
          role="dialog"
          aria-modal="true"
          aria-label="${this.label}"
        >
          <div class="command-palette__field">
            <span class="command-palette__search-icon">${ICON_SEARCH}</span>
            <input
              class="command-palette__input"
              data-palette-input
              type="text"
              role="combobox"
              autocomplete="off"
              spellcheck="false"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls="${listboxId}"
              aria-activedescendant="${active?.id ?? nothing}"
              aria-label="${this.placeholder}"
              placeholder="${this.placeholder}"
              .value="${live(this._query)}"
              @input="${this._handleInput}"
              @keydown="${this._handleInputKeydown}"
            />
            ${this._query
              ? html`<button
                  type="button"
                  class="command-palette__clear"
                  aria-label="${this.clearLabel}"
                  @click="${this._clear}"
                >
                  ${ICON_CLEAR}
                </button>`
              : nothing}
          </div>

          <div class="command-palette__panel">
            ${this._tags.length
              ? html`<div
                  class="command-palette__tags"
                  role="group"
                  aria-label="${this.tagsLabel}"
                >
                  ${this._tags.map((tag) => {
                    const pressed = tag.value === this._tag;
                    return html`<button
                      type="button"
                      class="command-palette__tag"
                      aria-pressed="${pressed ? 'true' : 'false'}"
                      @click="${() => this._toggleTag(tag.value)}"
                    >
                      <lui-tag
                        size="sm"
                        tag-style="${pressed ? 'container' : 'surface'}"
                        variant="${pressed ? 'primary' : 'neutral'}"
                        label="${tag.label}"
                      ></lui-tag>
                    </button>`;
                  })}
                </div>`
              : nothing}

            <div
              id="${listboxId}"
              class="command-palette__results"
              role="listbox"
              aria-label="${this.label}"
            >
              ${this._renderResults(this._visibleGroups)}
            </div>
            ${count
              ? nothing
              : html`<p class="command-palette__empty">${this.emptyText}</p>`}

            <lui-divider></lui-divider>
            <div class="command-palette__footer" aria-hidden="true">
              <span class="command-palette__legend">
                <span class="command-palette__keys">
                  <kbd class="shortcut__key command-palette__key"
                    >${KEY_UP}</kbd
                  >
                  <kbd class="shortcut__key command-palette__key"
                    >${KEY_DOWN}</kbd
                  >
                </span>
                ${this.navigateLabel}
              </span>
              <span class="command-palette__legend">
                <kbd class="shortcut__key command-palette__key"
                  >${KEY_ENTER}</kbd
                >
                ${this.selectLabel}
              </span>
              <span class="command-palette__legend">
                <kbd class="shortcut__key">Esc</kbd>
                ${this.closeLabel}
              </span>
            </div>
          </div>

          <div class="command-palette__status" role="status">
            ${this.open
              ? count
                ? this.resultsLabel.replace('{count}', String(count))
                : this.emptyText
              : ''}
          </div>
        </div>
      </div>
    `;
  }
}

/** Data-only children: the palette reads their attributes and renders them. */
export class LuiCommandGroup extends HTMLElement {}
export class LuiCommandItem extends HTMLElement {}
export class LuiCommandTag extends HTMLElement {}
