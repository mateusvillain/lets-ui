import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './switcher.scss?inline';
import { resolveSpace } from '../../utils/layout.js';

export class LuiSwitcher extends LitElement {
  static styles = unsafeCSS(styles);

  @property() threshold = '320px';
  @property() gap = '16';
  @property() limit = '';

  @state() private _count = 0;

  private _resizeObserver: ResizeObserver | null = null;
  private _mutationObserver: MutationObserver | null = null;

  private _syncSlots = () => {
    const items = Array.from(this.children) as HTMLElement[];
    items.forEach((el, i) => {
      if (el.getAttribute('slot') !== `item-${i}`) {
        el.setAttribute('slot', `item-${i}`);
      }
    });
    if (this._count !== items.length) {
      this._count = items.length;
    }
    this._updateLayout();
  };

  private _updateLayout = () => {
    const wrappers = Array.from(
      this.shadowRoot?.querySelectorAll<HTMLElement>('.switcher-item') ?? []
    );
    if (wrappers.length === 0) return;

    const containerWidth = this.getBoundingClientRect().width;
    const threshold = parseFloat(this.threshold) || 320;
    const limit = this.limit ? parseInt(this.limit, 10) : NaN;
    const stacked = containerWidth < threshold;

    wrappers.forEach((wrapper, i) => {
      const overLimit = !isNaN(limit) && i >= limit;
      if (overLimit || stacked) {
        wrapper.style.setProperty('flex-basis', '100%');
        wrapper.style.setProperty('flex-grow', '0');
      } else {
        wrapper.style.setProperty('flex-basis', '0px');
        wrapper.style.setProperty('flex-grow', '1');
      }
    });
  };

  override connectedCallback() {
    super.connectedCallback();
    this._resizeObserver = new ResizeObserver(this._updateLayout);
    this._resizeObserver.observe(this);
    this._mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.removedNodes.forEach((node) => {
          if (node instanceof Element) node.removeAttribute('slot');
        });
      }
      this._syncSlots();
    });
    this._mutationObserver.observe(this, { childList: true });
    this._syncSlots();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._mutationObserver?.disconnect();
    this._mutationObserver = null;
  }

  override updated() {
    const gap = resolveSpace(this.gap);
    if (gap) this.style.setProperty('--lui-switcher-gap', gap);
    else this.style.removeProperty('--lui-switcher-gap');
    this._updateLayout();
  }

  render() {
    return html`
      <div class="switcher-wrap">
        ${Array.from(
          { length: this._count },
          (_, i) => html`
            <div class="switcher-item">
              <slot name="item-${i}"></slot>
            </div>
          `
        )}
      </div>
    `;
  }
}
