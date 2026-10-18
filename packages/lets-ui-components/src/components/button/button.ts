import { LitElement, html, svg, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './button.scss?inline';
import { HostAriaMixin } from '../../utils/aria.js';
import { nameProperty } from '../../utils/form.js';

const spinnerIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true" class="btn__spinner">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="56.549" stroke-dashoffset="42.412"/>
</svg>`;

export class LuiButton extends HostAriaMixin(LitElement) {
  static styles = unsafeCSS(styles);
  static formAssociated = true;

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  @property() variant = 'primary';
  @property({ reflect: true }) size = 'lg';
  @property() type: 'button' | 'submit' | 'reset' = 'button';
  @property(nameProperty) name = '';
  @property() value = '';
  @property({ type: Boolean }) autofocus = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) block = false;
  @property({ type: Boolean }) loading = false;
  @property({ attribute: 'loading-text' }) loadingText = '';
  @property() label = '';
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
  // Set by a Tooltip that wraps this button and mirrored onto the inner
  // control. Not reflected: the host has no role, and the attribute there would
  // add a second, generic node to the accessibility tree.
  @property({ attribute: 'aria-description' })
  ariaDescription: string | null = null;
  @property() href = '';
  @property() target = '';
  @property() rel = '';
  @property() download?: string;

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private get _isLink(): boolean {
    return !!this.href;
  }

  private get _rel(): string | undefined {
    const tokens = new Set((this.rel ?? '').split(/\s+/).filter(Boolean));

    if (this.target === '_blank') {
      tokens.add('noopener');
      tokens.add('noreferrer');
    }

    return tokens.size ? [...tokens].join(' ') : undefined;
  }

  get _size(): 'lg' | 'md' {
    return this.size === 'md' ? 'md' : 'lg';
  }

  private get _classes(): string {
    return [
      'btn',
      `btn--${this.variant}`,
      `btn--${this._size}`,
      this.loading && 'btn--loading',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private _handleClick = () => {
    if (this.loading) return;
    const form = this._internals.form ?? this.closest('form');
    if (this.type === 'submit') {
      if (this.name) this._internals.setFormValue(this.value);
      form?.requestSubmit();
      if (this.name) this._internals.setFormValue(null);
    } else if (this.type === 'reset') {
      form?.reset();
    }
  };

  private _handleLinkClick = (e: Event) => {
    if (!this.disabled && !this.loading) return;

    e.preventDefault();

    // A native `<button disabled>` dispatches no click at all, while a
    // loading one still does — mirror both instead of picking one.
    if (this.disabled) e.stopPropagation();
  };

  // The default slot stays rendered while loading: a label passed as content
  // rather than through `label` is the only accessible name the button has.
  private _renderContent() {
    return this.loading
      ? html`${spinnerIcon}${this.loadingText ||
        html`<slot>${this.label}</slot>`}`
      : html`<slot name="prefix"></slot><slot>${this.label}</slot
          ><slot name="suffix"></slot>`;
  }

  // Only an explicit `aria-label` overrides the name. Otherwise it comes from
  // the rendered text — `label`, slotted content or `loading-text` — so the
  // name always matches what is on screen (WCAG 2.5.3).
  private get _ariaLabel(): string | undefined {
    return this.ariaLabel || undefined;
  }

  private _renderAnchor(isDisabled: boolean) {
    return html`
      <a
        class="${this._classes}"
        href="${ifDefined(isDisabled ? undefined : this.href)}"
        ?autofocus="${this.autofocus}"
        target="${ifDefined(isDisabled ? undefined : this.target || undefined)}"
        rel="${ifDefined(isDisabled ? undefined : this._rel)}"
        download="${ifDefined(isDisabled ? undefined : this.download)}"
        role="${ifDefined(isDisabled ? 'link' : undefined)}"
        tabindex="${ifDefined(
          this.disabled ? '-1' : this.loading ? '0' : undefined
        )}"
        aria-label="${ifDefined(this._ariaLabel)}"
        aria-disabled="${isDisabled ? 'true' : 'false'}"
        aria-busy="${ifDefined(this.loading ? 'true' : undefined)}"
        aria-expanded="${ifDefined(this.ariaExpanded || undefined)}"
        aria-haspopup="${ifDefined(this.ariaHasPopup || undefined)}"
        aria-description="${ifDefined(this.ariaDescription || undefined)}"
        @click="${this._handleLinkClick}"
      >
        ${this._renderContent()}
      </a>
    `;
  }

  render() {
    const isDisabled = this.disabled || this.loading;

    if (this._isLink) {
      return this._renderAnchor(isDisabled);
    }

    return html`
      <button
        class="${this._classes}"
        type="button"
        ?autofocus="${this.autofocus}"
        aria-label="${ifDefined(this._ariaLabel)}"
        ?disabled="${this.disabled}"
        aria-disabled="${isDisabled ? 'true' : 'false'}"
        aria-busy="${ifDefined(this.loading ? 'true' : undefined)}"
        aria-expanded="${ifDefined(this.ariaExpanded || undefined)}"
        aria-haspopup="${ifDefined(this.ariaHasPopup || undefined)}"
        aria-pressed="${ifDefined(this.ariaPressed || undefined)}"
        aria-description="${ifDefined(this.ariaDescription || undefined)}"
        @click="${this._handleClick}"
      >
        ${this._renderContent()}
      </button>
    `;
  }
}
