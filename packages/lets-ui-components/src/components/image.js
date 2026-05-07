import { hasBooleanAttribute, mountMarkup } from '../internal.js';

const VALID_FITS = ['cover', 'contain', 'none'];
const VALID_RADII = ['none', 'xs', 'sm', 'md', 'lg', 'circle'];

export class LuiImage extends HTMLElement {
  static observedAttributes = [
    'as',
    'src',
    'src-set',
    'alt',
    'width',
    'height',
    'aspect-ratio',
    'radius',
    'fit',
    'fill',
    'loading',
    'fallback-color',
    'fallback-src',
    'caption',
  ];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  #buildClasses() {
    const fit = this.getAttribute('fit') ?? 'cover';
    const radius = this.getAttribute('radius');

    const classes = ['img'];

    if (VALID_FITS.includes(fit)) classes.push(`img--fit-${fit}`);
    if (radius && VALID_RADII.includes(radius))
      classes.push(`radius-${radius}`);
    if (this.getAttribute('as') === 'picture') classes.push('img--picture');
    if (hasBooleanAttribute(this, 'fill')) classes.push('img--fill');

    return classes.join(' ');
  }

  #buildStyles() {
    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    const fillValue = this.getAttribute('fill');
    const ratio = this.getAttribute('aspect-ratio');
    const fallbackColor = this.getAttribute('fallback-color');
    const styles = [];

    if (width) styles.push(`width:${width}`);
    if (fillValue) styles.push(`height:${fillValue}`);
    else if (height) styles.push(`height:${height}`);
    if (ratio) styles.push(`aspect-ratio:${ratio}`);
    if (fallbackColor) styles.push(`background-color:${fallbackColor}`);

    return styles.length ? ` style="${styles.join(';')}"` : '';
  }

  #buildImgTag(src, srcSet, alt, loading) {
    const srcSetAttr = srcSet ? ` srcset="${srcSet}"` : '';
    return `<img class="img__element" src="${src}" alt="${alt}"${srcSetAttr} loading="${loading}" onload="this.closest('lui-image').__handleLoad()" onerror="this.closest('lui-image').__handleError()">`;
  }

  render() {
    const as = this.getAttribute('as') ?? 'image';
    const src = this.getAttribute('src') ?? '';
    const srcSet = this.getAttribute('src-set') ?? '';
    const alt = this.getAttribute('alt') ?? '';
    const loading = this.getAttribute('loading') ?? 'lazy';
    const caption = this.getAttribute('caption');

    const wrapperClass = this.#buildClasses();
    const wrapperStyle = this.#buildStyles();

    const imgTag = this.#buildImgTag(src, srcSet, alt, loading);

    const inner = as === 'picture' ? `<picture>${imgTag}</picture>` : imgTag;

    const imageEl = `<div class="${wrapperClass} img--loading"${wrapperStyle}>${inner}</div>`;

    const figureClass = hasBooleanAttribute(this, 'fill')
      ? 'img-figure img-figure--fill'
      : 'img-figure';

    const markup = caption
      ? `<figure class="${figureClass}">${imageEl}<figcaption>${caption}</figcaption></figure>`
      : imageEl;

    mountMarkup(this, markup);

    this.__handleLoad = () => {
      const wrapper = this.querySelector('.img');
      wrapper?.classList.remove('img--loading', 'img--error');
    };

    this.__handleError = () => {
      const wrapper = this.querySelector('.img');
      const fallbackSrc = this.getAttribute('fallback-src');
      const img = this.querySelector('img');

      wrapper?.classList.remove('img--loading');

      if (fallbackSrc && img && img.src !== fallbackSrc) {
        img.src = fallbackSrc;
        return;
      }

      wrapper?.classList.add('img--error');
      if (img) img.style.display = 'none';
    };
  }
}
