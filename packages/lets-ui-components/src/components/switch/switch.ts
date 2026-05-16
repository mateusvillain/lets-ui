import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './switch.scss?inline';

export class LuiSwitch extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;
  @property() size = 'lg';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  private _baseId: string;

  constructor() {
    super();
    this._baseId = `lui-switch-${Math.random().toString(36).slice(2, 9)}`;
  }

  get _size(): 'xl' | 'lg' | 'md' | 'sm' {
    const s = this.size;
    return (['xl', 'lg', 'md', 'sm'] as const).includes(
      s as 'xl' | 'lg' | 'md' | 'sm'
    )
      ? (s as 'xl' | 'lg' | 'md' | 'sm')
      : 'lg';
  }

  private _handleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  render() {
    const ariaLabel = this.ariaLabel || this.label || 'Switch';
    return html`
      <label class="switch switch--${this._size}">
        <input
          id="${this._baseId}-input"
          type="checkbox"
          role="switch"
          aria-label="${ariaLabel}"
          aria-checked="${this.checked}"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          ?aria-disabled="${this.disabled}"
          @change="${this._handleChange}"
        />
        <span id="${this._baseId}-label">${this.label}</span>
      </label>
    `;
  }
}
