import { LitElement, html, unsafeCSS, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './link.scss?inline';

const externalIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="3 3 18 18" aria-hidden="true" class="link__external-icon">
  <path fill="currentColor" d="M11.25 4.5a.75.75 0 0 1 0 1.5H6v12h12v-5.25a.75.75 0 0 1 1.5 0V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5h5.25Zm9-1.5a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V5.56l-6.22 6.22a.75.75 0 1 1-1.06-1.06l6.22-6.22h-4.19a.75.75 0 0 1 0-1.5h6Z"/>
</svg>`;

export class LuiLink extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property() href = '#';
  @property() size = '';
  @property() target = '_self';
  @property() rel = '';
  @property() download = '';
  @property() hreflang = '';
  @property() referrerpolicy = '';
  @property({ type: Boolean }) external = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) visited = false;
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  private get _target(): string {
    return this.external ? '_blank' : this.target;
  }

  private get _rel(): string | undefined {
    if (this.rel) return this.rel;
    if (this._target === '_blank') return 'noopener noreferrer';
    return undefined;
  }

  private get _classes(): string {
    return [
      'link',
      this.size &&
        ['lg', 'md', 'sm'].includes(this.size) &&
        `link--${this.size}`,
      this.visited && 'link--visited',
    ]
      .filter(Boolean)
      .join(' ');
  }

  render() {
    return html`<a
      class="${this._classes}"
      href="${ifDefined(this.disabled ? undefined : this.href)}"
      target="${ifDefined(
        this.disabled ? undefined : this._target || undefined
      )}"
      rel="${ifDefined(this.disabled ? undefined : this._rel)}"
      download="${ifDefined(this.download || undefined)}"
      hreflang="${ifDefined(this.hreflang || undefined)}"
      referrerpolicy="${ifDefined(this.referrerpolicy || undefined)}"
      tabindex="${ifDefined(this.disabled ? '0' : undefined)}"
      aria-disabled="${ifDefined(this.disabled ? 'true' : undefined)}"
      aria-label="${ifDefined(this.ariaLabel || undefined)}"
      ><slot>${this.label}</slot>${this.external
        ? html`${externalIcon}<span
              style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0"
              >(abre em nova aba)</span
            >`
        : ''}</a
    >`;
  }
}
