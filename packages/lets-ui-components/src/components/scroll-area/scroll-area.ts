import { LitElement, html, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import styles from './scroll-area.scss?inline';

type Orientation = 'vertical' | 'horizontal' | 'both';
type ScrollbarVisibility = 'auto' | 'always' | 'hover' | 'hidden';
type SnapAlign = 'start' | 'center' | 'end';
type Overscroll = 'auto' | 'contain' | 'none';
type FadeSide = 'top' | 'bottom' | 'left' | 'right';

const FADE_SIDES: FadeSide[] = ['top', 'bottom', 'left', 'right'];

function resolveSize(value: string): string {
  if (!value) return '';
  return /^\d+(\.\d+)?$/.test(value.trim()) ? `${value}px` : value;
}

export class LuiScrollArea extends LitElement {
  static styles = unsafeCSS(styles);

  @property() orientation: Orientation = 'vertical';
  @property({ attribute: 'scrollbar-visibility' })
  scrollbarVisibility: ScrollbarVisibility = 'auto';
  @property() fade = '';
  @property({ attribute: 'scroll-shadow', type: Boolean, reflect: true })
  scrollShadow = false;
  @property({ type: Boolean, reflect: true }) snap = false;
  @property({ attribute: 'snap-align' }) snapAlign: SnapAlign = 'start';
  @property() overscroll: Overscroll = 'auto';
  @property() height = '';
  @property({ attribute: 'max-height' }) maxHeight = '';
  @property({ attribute: 'max-width' }) maxWidth = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query('.scroll-area__viewport') private _viewport!: HTMLElement;

  private _resizeObserver: ResizeObserver | null = null;
  private _scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
  private _isScrolling = false;
  private _prevAtTop = true;
  private _prevAtBottom = false;
  private _prevAtLeft = true;
  private _prevAtRight = false;

  private get _parsedFadeSides(): Set<FadeSide> {
    const attr = this.getAttribute('fade');
    if (attr === null) return new Set();
    if (attr === '' || attr === 'true') {
      const sides = new Set<FadeSide>();
      if (this.orientation !== 'horizontal') {
        sides.add('top');
        sides.add('bottom');
      }
      if (this.orientation !== 'vertical') {
        sides.add('left');
        sides.add('right');
      }
      return sides;
    }
    return new Set(
      attr
        .split(/\s+/)
        .filter((s): s is FadeSide => FADE_SIDES.includes(s as FadeSide))
    );
  }

  override connectedCallback() {
    super.connectedCallback();
    this._resizeObserver = new ResizeObserver(() => this._updateIndicators());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    if (this._scrollEndTimer !== null) {
      clearTimeout(this._scrollEndTimer);
      this._scrollEndTimer = null;
    }
  }

  override firstUpdated() {
    const vp = this._viewport;
    if (!vp) return;
    this._resizeObserver?.observe(vp);
    this._updateLayout();
    this._updateIndicators();
  }

  override updated() {
    this._updateLayout();
    this._updateIndicators();
  }

  private _updateLayout() {
    const vp = this._viewport;
    if (!vp) return;

    vp.style.height = resolveSize(this.height);
    vp.style.maxHeight = resolveSize(this.maxHeight);
    vp.style.maxWidth = resolveSize(this.maxWidth);
    vp.style.overscrollBehavior = this.overscroll;

    if (this.disabled) {
      vp.style.overflowX = 'hidden';
      vp.style.overflowY = 'hidden';
    } else {
      const overflow =
        this.scrollbarVisibility === 'always' ? 'scroll' : 'auto';
      vp.style.overflowY =
        this.orientation !== 'horizontal' ? overflow : 'hidden';
      vp.style.overflowX =
        this.orientation !== 'vertical' ? overflow : 'hidden';
    }

    if (this.snap && !this.disabled) {
      const axis =
        this.orientation === 'vertical'
          ? 'y'
          : this.orientation === 'horizontal'
            ? 'x'
            : 'both';
      vp.style.scrollSnapType = `${axis} mandatory`;
    } else {
      vp.style.scrollSnapType = '';
    }

    this.style.setProperty(
      '--lui-scroll-snap-align',
      this.snap ? this.snapAlign : 'none'
    );
  }

  private _updateIndicators() {
    const sr = this.shadowRoot;
    const vp = this._viewport;
    if (!sr || !vp) return;

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = vp;
    const threshold = 1;

    const atTop = scrollTop <= threshold;
    const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    const atLeft = scrollLeft <= threshold;
    const atRight = scrollLeft + clientWidth >= scrollWidth - threshold;

    const fadeSides = this._parsedFadeSides;
    const useFade = fadeSides.size > 0;
    const useShadow = this.scrollShadow;

    const isVertical = this.orientation !== 'horizontal';
    const isHorizontal = this.orientation !== 'vertical';

    const show = (side: FadeSide, hasOverflow: boolean): boolean => {
      if (!hasOverflow) return false;
      if (useShadow) {
        if ((side === 'top' || side === 'bottom') && isVertical) return true;
        if ((side === 'left' || side === 'right') && isHorizontal) return true;
      }
      return useFade && fadeSides.has(side);
    };

    for (const side of FADE_SIDES) {
      const el = sr.querySelector<HTMLElement>(`.scroll-area__fade--${side}`);
      if (!el) continue;
      const hasOverflow =
        side === 'top'
          ? !atTop
          : side === 'bottom'
            ? !atBottom
            : side === 'left'
              ? !atLeft
              : !atRight;
      el.classList.toggle('is-visible', show(side, hasOverflow));
    }
  }

  private _handleScroll() {
    if (this.disabled) return;

    const vp = this._viewport;
    if (!vp) return;

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = vp;
    const threshold = 1;

    const atTop = scrollTop <= threshold;
    const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    const atLeft = scrollLeft <= threshold;
    const atRight = scrollLeft + clientWidth >= scrollWidth - threshold;

    this._updateIndicators();

    this._emit('scroll', {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    });

    if (!this._isScrolling) {
      this._isScrolling = true;
      this._emit('scroll-start');
    }

    if (this._scrollEndTimer !== null) clearTimeout(this._scrollEndTimer);
    this._scrollEndTimer = setTimeout(() => {
      this._isScrolling = false;
      this._scrollEndTimer = null;
      this._emit('scroll-end');
    }, 150);

    if (atTop && !this._prevAtTop) this._emit('reach-top');
    if (atBottom && !this._prevAtBottom) this._emit('reach-bottom');
    if (atLeft && !this._prevAtLeft) this._emit('reach-left');
    if (atRight && !this._prevAtRight) this._emit('reach-right');

    this._prevAtTop = atTop;
    this._prevAtBottom = atBottom;
    this._prevAtLeft = atLeft;
    this._prevAtRight = atRight;
  }

  private _handleSlotChange() {
    this._updateIndicators();
  }

  private _emit(name: string, detail?: Record<string, unknown>) {
    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true,
        detail: detail ?? null,
      })
    );
  }

  render() {
    const { orientation, scrollbarVisibility, scrollShadow } = this;
    const fadeSides = this._parsedFadeSides;
    const useFade = fadeSides.size > 0;

    const baseClass = [
      'scroll-area',
      `scroll-area--${orientation}`,
      `scroll-area--scrollbar-${scrollbarVisibility}`,
      scrollShadow ? 'scroll-area--shadow' : '',
      useFade ? 'scroll-area--fade' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="${baseClass}" part="base">
        <div
          class="scroll-area__viewport"
          part="viewport"
          tabindex="${this.disabled ? '-1' : '0'}"
          @scroll="${this._handleScroll}"
        >
          <slot @slotchange="${this._handleSlotChange}"></slot>
        </div>
        <div
          class="scroll-area__fade scroll-area__fade--top"
          aria-hidden="true"
        ></div>
        <div
          class="scroll-area__fade scroll-area__fade--bottom"
          aria-hidden="true"
        ></div>
        <div
          class="scroll-area__fade scroll-area__fade--left"
          aria-hidden="true"
        ></div>
        <div
          class="scroll-area__fade scroll-area__fade--right"
          aria-hidden="true"
        ></div>
      </div>
    `;
  }
}
