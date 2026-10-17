import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './icon-button.scss?inline';

export class LuiIconButton extends LitElement {
  static styles = unsafeCSS(styles);

  @property() size = 'md';
  @property({ type: Boolean }) disabled = false;
  @property({ attribute: 'aria-label' }) ariaLabel = '';
  // Set by a Tooltip that wraps this button and mirrored onto the inner
  // control. Not reflected: the host has no role, and the attribute there would
  // add a second, generic node to the accessibility tree.
  @property({ attribute: 'aria-description' })
  ariaDescription: string | null = null;

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'md';
  }

  render() {
    return html`
      <button
        class="icon-button icon-button--${this._size}"
        aria-label="${this.ariaLabel}"
        ?disabled="${this.disabled}"
        ?aria-disabled="${this.disabled}"
        aria-description="${ifDefined(this.ariaDescription || undefined)}"
      >
        <slot></slot>
      </button>
    `;
  }
}
