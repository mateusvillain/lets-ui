import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './close-button.scss?inline';

export class LuiCloseButton extends LitElement {
  static styles = unsafeCSS(styles);

  @property() size = 'md';
  @property({ type: Boolean }) disabled = false;
  @property() label = 'Close';
  // Set by a Tooltip that wraps this button and mirrored onto the inner
  // control. Not reflected: the host has no role, and the attribute there would
  // add a second, generic node to the accessibility tree.
  @property({ attribute: 'aria-description' })
  ariaDescription: string | null = null;

  get _size(): 'sm' | 'md' | 'lg' {
    const s = this.size;
    return (['sm', 'md', 'lg'] as const).includes(s as 'sm' | 'md' | 'lg')
      ? (s as 'sm' | 'md' | 'lg')
      : 'md';
  }

  render() {
    return html`
      <button
        type="button"
        class="close-button close-button--${this._size}"
        aria-label="${this.label}"
        ?disabled="${this.disabled}"
        ?aria-disabled="${this.disabled}"
        aria-description="${ifDefined(this.ariaDescription || undefined)}"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M17.4697 5.46973C17.7626 5.17683 18.2373 5.17683 18.5302 5.46973C18.8231 5.76262 18.8231 6.23738 18.5302 6.53027L13.0605 12L18.5302 17.4697C18.8231 17.7626 18.8231 18.2374 18.5302 18.5303C18.2373 18.8232 17.7626 18.8232 17.4697 18.5303L11.9999 13.0605L6.53022 18.5303C6.23732 18.8232 5.76256 18.8232 5.46967 18.5303C5.17678 18.2374 5.17678 17.7626 5.46967 17.4697L10.9394 12L5.46967 6.53027C5.17678 6.23738 5.17678 5.76262 5.46967 5.46973C5.76256 5.17683 6.23732 5.17683 6.53022 5.46973L11.9999 10.9395L17.4697 5.46973Z"
          />
        </svg>
      </button>
    `;
  }
}
