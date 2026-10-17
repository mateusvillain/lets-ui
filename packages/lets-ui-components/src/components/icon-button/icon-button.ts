import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './icon-button.scss?inline';

export class LuiIconButton extends LitElement {
  static styles = unsafeCSS(styles);

  @property() size = 'md';
  @property({ type: Boolean }) disabled = false;
  @property({ attribute: 'aria-label' }) ariaLabel = '';
  // State ARIA set on the host — by the author or by a Modal or Drawer this
  // button triggers — never reaches the inner control on its own, and the host
  // has no role to carry it, so it is mirrored onto the element that does.
  // These accessors replace the native reflecting ones, so they reflect too.
  @property({ attribute: 'aria-expanded', reflect: true })
  ariaExpanded: string | null = null;
  @property({ attribute: 'aria-haspopup', reflect: true })
  ariaHasPopup: string | null = null;
  @property({ attribute: 'aria-pressed', reflect: true })
  ariaPressed: string | null = null;

  // Only `lg` and `md` are styled. Any other value would render a button with
  // no padding or size — a target a few pixels wide — so it falls back to `md`.
  get _size(): 'lg' | 'md' {
    return this.size === 'lg' ? 'lg' : 'md';
  }

  render() {
    return html`
      <button
        class="icon-button icon-button--${this._size}"
        aria-label="${ifDefined(this.ariaLabel || undefined)}"
        ?disabled="${this.disabled}"
        aria-expanded="${ifDefined(this.ariaExpanded ?? undefined)}"
        aria-haspopup="${ifDefined(this.ariaHasPopup ?? undefined)}"
        aria-pressed="${ifDefined(this.ariaPressed ?? undefined)}"
      >
        <slot></slot>
      </button>
    `;
  }
}
