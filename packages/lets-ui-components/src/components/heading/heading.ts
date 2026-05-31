import { LitElement, unsafeCSS } from 'lit';
import { staticHtml, unsafeStatic } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import styles from './heading.scss?inline';

const DEFAULT_TAGS: Record<string, string> = {
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

export class LuiHeading extends LitElement {
  static styles = unsafeCSS(styles);

  @property() label = '';
  @property() variant = 'title';
  @property() as = '';
  @property() align = '';
  @property({ attribute: 'line-clamp' }) lineClamp = '';
  @property() transform = '';
  @property() color = 'heading';

  render() {
    const variant = VALID_VARIANTS.includes(this.variant)
      ? this.variant
      : 'title';
    const tag = this.as || DEFAULT_TAGS[variant];
    const lineClamp = parseInt(this.lineClamp, 10) || null;

    const classes = [
      variant,
      `text--color-${this.color}`,
      VALID_ALIGNS.includes(this.align) && `text--align-${this.align}`,
      VALID_TRANSFORMS.includes(this.transform) &&
        `text--transform-${this.transform}`,
    ]
      .filter(Boolean)
      .join(' ');

    const style = lineClamp
      ? `overflow: hidden; display: -webkit-box; -webkit-line-clamp: ${lineClamp}; -webkit-box-orient: vertical;`
      : '';

    return staticHtml`<${unsafeStatic(tag)} class="${classes}" style="${style}">
      <slot>${this.label}</slot>
    </${unsafeStatic(tag)}>`;
  }
}
