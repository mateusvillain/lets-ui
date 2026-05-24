import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './body.scss?inline';

const VALID_VARIANTS = ['lg', 'md', 'sm'] as const;
const VALID_ALIGNS = ['left', 'center', 'right', 'justify'] as const;
const VALID_TRANSFORMS = [
  'none',
  'uppercase',
  'lowercase',
  'capitalize',
] as const;

type Variant = (typeof VALID_VARIANTS)[number];
type Align = (typeof VALID_ALIGNS)[number];
type Transform = (typeof VALID_TRANSFORMS)[number];

export class LuiBody extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property() variant = 'md';
  @property() as = 'p';
  @property() align = '';
  @property({ attribute: 'line-clamp' }) lineClamp = '';
  @property() transform = '';
  @property() color = 'body';
  @property({ type: Boolean }) italic = false;
  @property({ type: Boolean }) underline = false;

  get _variant(): Variant {
    return (VALID_VARIANTS as readonly string[]).includes(this.variant)
      ? (this.variant as Variant)
      : 'md';
  }

  render() {
    const variant = this._variant;
    const lineClamp = parseInt(this.lineClamp, 10) || null;

    const classes = [
      `body--${variant}`,
      `text--color-${this.color}`,
      (VALID_ALIGNS as readonly string[]).includes(this.align) &&
        `text--align-${this.align}`,
      (VALID_TRANSFORMS as readonly string[]).includes(this.transform) &&
        `text--transform-${this.transform}`,
      this.italic && 'text--style-italic',
      this.underline && 'text--decoration-underline',
    ]
      .filter(Boolean)
      .join(' ');

    const style = lineClamp
      ? `overflow: hidden; display: -webkit-box; -webkit-line-clamp: ${lineClamp}; -webkit-box-orient: vertical;`
      : '';

    // Use dynamic tag name via template
    return html`<div class="${classes}" style="${style}">
      <slot>${this.label}</slot>
    </div>`;
  }
}
