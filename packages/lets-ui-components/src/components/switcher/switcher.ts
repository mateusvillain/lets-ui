import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './switcher.scss?inline';
import { resolveSpace } from '../../utils/layout.js';

export class LuiSwitcher extends LitElement {
  static styles = unsafeCSS(styles);

  @property() threshold = '320px';
  @property() gap = 'md';
  @property() limit = '';

  private _applyToSlotted = () => {
    const slot = this.shadowRoot?.querySelector(
      'slot'
    ) as HTMLSlotElement | null;
    if (!slot) return;

    const threshold = this.threshold || '320px';
    const limit = this.limit ? parseInt(this.limit, 10) : NaN;
    const items = slot.assignedElements() as HTMLElement[];

    items.forEach((el, i) => {
      const forceStack = !isNaN(limit) && i >= limit;
      el.style.setProperty(
        'flex-basis',
        forceStack ? '100%' : `calc((${threshold} - 100%) * 999)`
      );
      el.style.setProperty('flex-grow', '1');
      el.style.setProperty('min-width', '0');
    });
  };

  override updated(changed: Map<string, unknown>) {
    if (changed.has('threshold') || changed.has('limit')) {
      this._applyToSlotted();
    }

    const gap = resolveSpace(this.gap);
    if (gap) this.style.setProperty('--lui-switcher-gap', gap);
    else this.style.removeProperty('--lui-switcher-gap');
  }

  render() {
    return html`<slot @slotchange=${this._applyToSlotted}></slot>`;
  }
}
