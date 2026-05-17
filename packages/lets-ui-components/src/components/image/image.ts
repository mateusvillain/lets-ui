import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './image.scss?inline';

const VALID_FITS = ['cover', 'contain', 'none'];
const VALID_RADII = ['none', 'xs', 'sm', 'md', 'lg', 'circle'];

export class LuiImage extends LitElement {
  static styles = unsafeCSS(styles);

  @property() as = 'image';
  @property() src = '';
  @property({ attribute: 'src-set' }) srcSet = '';
  @property() alt = '';
  @property() width = '';
  @property() height = '';
  @property({ attribute: 'aspect-ratio' }) aspectRatio = '';
  @property() radius = '';
  @property() fit = 'cover';
  @property() fill = '';
  @property() loading = 'lazy';
  @property({ attribute: 'fallback-color' }) fallbackColor = '';
  @property({ attribute: 'fallback-src' }) fallbackSrc = '';
  @property() caption = '';

  @state() private _loaded = false;
  @state() private _error = false;

  private _buildClasses(): string {
    const classes = ['img'];
    if (VALID_FITS.includes(this.fit)) classes.push(`img--fit-${this.fit}`);
    if (this.radius && VALID_RADII.includes(this.radius))
      classes.push(`radius-${this.radius}`);
    if (this.as === 'picture') classes.push('img--picture');
    if (this.fill && this.fill !== 'false') classes.push('img--fill');
    if (!this._loaded && !this._error) classes.push('img--loading');
    if (this._error) classes.push('img--error');
    return classes.join(' ');
  }

  private _buildStyles(): string {
    const styles: string[] = [];
    if (this.width) styles.push(`width:${this.width}`);
    if (this.fill && this.fill !== 'false') styles.push(`height:${this.fill}`);
    else if (this.height) styles.push(`height:${this.height}`);
    if (this.aspectRatio) styles.push(`aspect-ratio:${this.aspectRatio}`);
    if (this.fallbackColor)
      styles.push(`background-color:${this.fallbackColor}`);
    return styles.join(';');
  }

  private _handleLoad() {
    this._loaded = true;
    this._error = false;
  }

  private _handleError() {
    if (this.fallbackSrc) {
      const img = this.shadowRoot?.querySelector<HTMLImageElement>('img');
      if (img && img.src !== this.fallbackSrc) {
        img.src = this.fallbackSrc;
        return;
      }
    }
    this._error = true;
    this._loaded = false;
  }

  render() {
    const wrapperClass = this._buildClasses();
    const wrapperStyle = this._buildStyles();

    const imgEl = html`
      <img
        class="img__element"
        src="${this.src}"
        alt="${this.alt}"
        srcset="${this.srcSet}"
        loading="${this.loading as 'lazy' | 'eager'}"
        @load="${this._handleLoad}"
        @error="${this._handleError}"
        style="${this._error ? 'display:none' : ''}"
      />
    `;

    const inner =
      this.as === 'picture' ? html`<picture>${imgEl}</picture>` : imgEl;

    const isFill = this.fill && this.fill !== 'false';
    const figureClass = isFill ? 'img-figure img-figure--fill' : 'img-figure';

    const imageEl = html`<div class="${wrapperClass}" style="${wrapperStyle}">
      ${inner}
    </div>`;

    if (this.caption) {
      return html`
        <figure class="${figureClass}">
          ${imageEl}
          <figcaption>${this.caption}</figcaption>
        </figure>
      `;
    }

    return imageEl;
  }
}
