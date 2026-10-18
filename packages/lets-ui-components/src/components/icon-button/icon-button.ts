import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './icon-button.scss?inline';
import { TriggerAriaMixin, stateAria } from '../../utils/aria.js';

export class LuiIconButton extends TriggerAriaMixin(LitElement) {
  static styles = unsafeCSS(styles);

  @property() size = 'md';
  @property({ type: Boolean }) disabled = false;
  // Taken off the host and rendered on the inner control; see `HostAriaMixin`.
  @property({ attribute: 'aria-label' }) ariaLabel = '';

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
        aria-expanded="${ifDefined(stateAria(this.ariaExpanded))}"
        aria-haspopup="${ifDefined(stateAria(this.ariaHasPopup))}"
        aria-pressed="${ifDefined(stateAria(this.ariaPressed))}"
      >
        <slot></slot>
      </button>
    `;
  }
}
