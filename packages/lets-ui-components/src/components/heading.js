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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export class LuiHeading extends HTMLElement {
  static observedAttributes = [
    'label',
    'variant',
    'as',
    'align',
    'line-clamp',
    'transform',
    'color',
  ];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const rawVariant = this.getAttribute('variant');
    const variant = VALID_VARIANTS.includes(rawVariant) ? rawVariant : 'title';
    const as = this.getAttribute('as') ?? DEFAULT_TAGS[variant];
    const align = this.getAttribute('align');
    const lineClamp = parseInt(this.getAttribute('line-clamp'), 10) || null;
    const transform = this.getAttribute('transform');
    const color = this.getAttribute('color') ?? 'heading';
    const label = escapeHtml(this.getAttribute('label') ?? '');

    const classes = [
      variant,
      `text--color-${color}`,
      VALID_ALIGNS.includes(align) && `text--align-${align}`,
      VALID_TRANSFORMS.includes(transform) && `text--transform-${transform}`,
    ]
      .filter(Boolean)
      .join(' ');

    const styleAttr = lineClamp
      ? ` style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: ${lineClamp}; -webkit-box-orient: vertical;"`
      : '';

    mountMarkup(this, `<${as} class="${classes}"${styleAttr}>${label}</${as}>`);
  }
}
