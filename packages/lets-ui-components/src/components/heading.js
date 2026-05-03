import { mountMarkup } from '../internal.js';

const DEFAULT_TAGS = {
  display: 'div',
  title: 'h1',
  subtitle: 'h2',
  headline: 'h3',
  subheadline: 'h4',
  'block-title': 'h5',
  overtitle: 'h6',
};

const VALID_VARIANTS = Object.keys(DEFAULT_TAGS);
const VALID_ALIGNS = ['left', 'center', 'right', 'justify'];
const VALID_TRANSFORMS = ['none', 'uppercase', 'lowercase', 'capitalize'];

export class LuiHeading extends HTMLElement {
  static observedAttributes = [
    'variant',
    'as',
    'align',
    'line-clamp',
    'transform',
    'color',
  ];

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    queueMicrotask(() => {
      this._captureContent();
      this.render();
    });
  }

  attributeChangedCallback() {
    if (this._initialized) this.render();
  }

  _captureContent() {
    if (this._contentCaptured) return;
    this._contentHtml = Array.from(this.childNodes)
      .map((node) =>
        node.nodeType === Node.TEXT_NODE ? node.textContent : node.outerHTML
      )
      .join('');
    this._contentCaptured = true;
  }

  render() {
    const rawVariant = this.getAttribute('variant');
    const variant = VALID_VARIANTS.includes(rawVariant) ? rawVariant : 'title';
    const as = this.getAttribute('as') ?? DEFAULT_TAGS[variant];
    const align = this.getAttribute('align');
    const lineClamp = parseInt(this.getAttribute('line-clamp'), 10) || null;
    const transform = this.getAttribute('transform');
    const color = this.getAttribute('color') ?? 'heading';

    const classes = [
      variant,
      `lui-heading--color-${color}`,
      VALID_ALIGNS.includes(align) && `typography--align-${align}`,
      VALID_TRANSFORMS.includes(transform) &&
        `typography--transform-${transform}`,
    ]
      .filter(Boolean)
      .join(' ');

    const styleAttr = lineClamp
      ? ` style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: ${lineClamp}; -webkit-box-orient: vertical;"`
      : '';

    mountMarkup(
      this,
      `<${as} class="${classes}"${styleAttr}>${this._contentHtml ?? ''}</${as}>`
    );
  }
}
