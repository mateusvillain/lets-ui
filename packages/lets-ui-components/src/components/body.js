import { hasBooleanAttribute, mountMarkup } from '../internal.js';

const VALID_VARIANTS = ['lg', 'md', 'sm'];
const VALID_ALIGNS = ['left', 'center', 'right', 'justify'];
const VALID_TRANSFORMS = ['none', 'uppercase', 'lowercase', 'capitalize'];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export class LuiBody extends HTMLElement {
  static observedAttributes = [
    'label',
    'variant',
    'as',
    'align',
    'line-clamp',
    'transform',
    'color',
    'italic',
    'underline',
  ];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const rawVariant = this.getAttribute('variant');
    const variant = VALID_VARIANTS.includes(rawVariant) ? rawVariant : 'md';
    const as = this.getAttribute('as') ?? 'p';
    const align = this.getAttribute('align');
    const lineClamp = parseInt(this.getAttribute('line-clamp'), 10) || null;
    const transform = this.getAttribute('transform');
    const color = this.getAttribute('color') ?? 'body';
    const italic = hasBooleanAttribute(this, 'italic');
    const underline = hasBooleanAttribute(this, 'underline');
    const label = escapeHtml(this.getAttribute('label') ?? '');

    const classes = [
      `body--${variant}`,
      `text--color-${color}`,
      VALID_ALIGNS.includes(align) && `text--align-${align}`,
      VALID_TRANSFORMS.includes(transform) && `text--transform-${transform}`,
      italic && 'text--style-italic',
      underline && 'text--decoration-underline',
    ]
      .filter(Boolean)
      .join(' ');

    const styleAttr = lineClamp
      ? ` style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: ${lineClamp}; -webkit-box-orient: vertical;"`
      : '';

    mountMarkup(this, `<${as} class="${classes}"${styleAttr}>${label}</${as}>`);
  }
}
