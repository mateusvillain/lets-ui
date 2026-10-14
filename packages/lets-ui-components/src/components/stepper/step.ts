import { LitElement, html, nothing, svg, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './step.scss?inline';

export type StepStatus = 'completed' | 'active' | 'upcoming';

const spinnerIcon = svg`<svg class="stepper__spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" aria-hidden="true">
  <circle cx="10" cy="10" r="9.5" stroke="currentColor" stroke-linecap="round" stroke-dasharray="59.69" stroke-dashoffset="14.92"/>
</svg>`;

export class LuiStep extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property() description = '';
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  // Pushed down by the parent `lui-stepper`.
  @property({ attribute: false }) index = 1;
  @property({ attribute: false }) status: StepStatus = 'upcoming';
  @property({ attribute: false }) last = false;
  @property({ attribute: false }) navigable = true;
  @property({ attribute: false }) orientation: 'horizontal' | 'vertical' =
    'horizontal';
  @property({ attribute: false }) labelsBottom = false;
  @property({ attribute: false }) completedLabel = 'Completed';
  @property({ attribute: false }) loadingLabel = 'Loading';
  @property({ attribute: false }) position = '';

  connectedCallback() {
    super.connectedCallback();
    // The host is what sits in the stepper's list, so it carries the item role.
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  // The focusable part is the trigger inside the shadow root, not the host.
  focus(options?: FocusOptions) {
    this.shadowRoot?.querySelector('button')?.focus(options);
  }

  private _select() {
    if (this.disabled || !this.navigable) return;
    this.dispatchEvent(new CustomEvent('lui-step-select', { bubbles: true }));
  }

  private _renderStatus() {
    const text = this.loading
      ? this.loadingLabel
      : this.status === 'completed'
        ? this.completedLabel
        : '';
    return text ? html`<span class="stepper__status">${text}</span>` : nothing;
  }

  render() {
    const wrapper = [
      'stepper',
      `stepper--${this.orientation}`,
      this.labelsBottom && 'stepper--labels-bottom',
    ]
      .filter(Boolean)
      .join(' ');

    const item = [
      'stepper__item',
      `stepper__item--${this.status}`,
      this.loading && 'stepper__item--loading',
    ]
      .filter(Boolean)
      .join(' ');

    // A linear stepper's steps ahead of the current one are aria-disabled
    // without being `disabled`: they keep their colour and their focus stop.
    const ariaDisabled = this.disabled || !this.navigable;

    // The visible number is hidden from assistive technology: the position text
    // says the same thing with the total ("Step 2 of 4"), and survives the
    // spinner replacing the number while the step is loading.
    // The wrapper repeats the group's classes so the orientation rules of the
    // CSS class API, written against `.stepper--vertical .stepper__item`, reach
    // this shadow root too.
    return html`
      <div class="${wrapper}">
        <div class="${item}">
          <button
            class="stepper__trigger"
            type="button"
            aria-current="${ifDefined(
              this.status === 'active' ? 'step' : undefined
            )}"
            aria-busy="${ifDefined(this.loading ? 'true' : undefined)}"
            aria-disabled="${ifDefined(ariaDisabled ? 'true' : undefined)}"
            ?disabled="${this.disabled}"
            @click="${this._select}"
          >
            ${this.position
              ? html`<span class="stepper__position">${this.position}</span>`
              : nothing}
            <span class="stepper__indicator" aria-hidden="true">
              <span class="stepper__circle">
                ${this.loading
                  ? spinnerIcon
                  : html`<span class="stepper__number">${this.index}</span>`}
              </span>
            </span>
            ${this.label || this.description
              ? html`<span class="stepper__text">
                  ${this.label
                    ? html`<span class="stepper__label">${this.label}</span>`
                    : nothing}
                  ${this.description
                    ? html`<span class="stepper__description"
                        >${this.description}</span
                      >`
                    : nothing}
                </span>`
              : nothing}
            ${this._renderStatus()}
          </button>
          <span
            class="stepper__connector"
            aria-hidden="true"
            ?hidden="${this.last}"
          ></span>
        </div>
      </div>
    `;
  }
}
