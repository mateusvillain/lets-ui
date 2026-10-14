import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './skeleton.scss?inline';

const SHAPES = ['text', 'circle', 'rectangle'] as const;
type SkeletonShape = (typeof SHAPES)[number];

export class LuiSkeleton extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ reflect: true }) shape = 'text';
  @property() width = '';
  @property() height = '';
  @property() label = '';

  private get _shape(): SkeletonShape {
    const value = this.shape.trim().toLowerCase();
    return (SHAPES as readonly string[]).includes(value)
      ? (value as SkeletonShape)
      : 'text';
  }

  protected willUpdate(): void {
    const shape = this._shape;
    if (this.shape !== shape) this.shape = shape;

    // Bones inside a composition stay out of the accessibility tree. A single
    // placeholder that stands in for a region announces itself once, through
    // the label. The parent that will swap in the real content owns aria-busy.
    const label = this.label.trim();
    if (label) {
      this.setAttribute('role', 'status');
      this.setAttribute('aria-label', label);
      this.removeAttribute('aria-hidden');
    } else {
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
      this.setAttribute('aria-hidden', 'true');
    }

    this._syncSize('--lui-skeleton-width', this.width);
    this._syncSize('--lui-skeleton-height', this.height);
  }

  private _syncSize(name: string, value: string) {
    const next = value.trim();
    if (next) this.style.setProperty(name, next);
    else this.style.removeProperty(name);
  }

  render() {
    return html`<div class="skeleton skeleton--${this._shape}"></div>`;
  }
}
