import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './icon-button.scss?inline';
import { HostAriaMixin } from '../../utils/aria.js';

export class LuiIconButton extends HostAriaMixin(LitElement) {
  static styles = unsafeCSS(styles);

  @property() size = 'md';
  @property({ type: Boolean }) disabled = false;
  // ARIA set on the host — by the author or by a Modal or Drawer this button
  // triggers — is rendered on the inner control, the element with a role.
  // `HostAriaMixin` removes the host attribute so the role-less host isn't
  // exposed as a second node. An empty value is not a valid ARIA token, so it
  // renders no attribute.
  @property({ attribute: 'aria-label' }) ariaLabel = '';
  @property({ attribute: 'aria-expanded' })
  ariaExpanded: string | null = null;
  @property({ attribute: 'aria-haspopup' })
  ariaHasPopup: string | null = null;
  @property({ attribute: 'aria-pressed' })
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
        aria-expanded="${ifDefined(this.ariaExpanded || undefined)}"
        aria-haspopup="${ifDefined(this.ariaHasPopup || undefined)}"
        aria-pressed="${ifDefined(this.ariaPressed || undefined)}"
      >
        <slot></slot>
      </button>
    `;
  }
}
