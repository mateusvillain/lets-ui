import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './float.scss?inline';
import { DirectionController, isRtl } from '../../utils/direction.js';

interface PlacementConfig {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  tx: string;
  ty: string;
}

// Written left to right: `start` is the left edge. `updated()` mirrors them
// for a right-to-left host.
const PLACEMENTS: Record<string, PlacementConfig> = {
  'top-start': { top: '0', left: '0', tx: '-50%', ty: '-50%' },
  'top-center': { top: '0', left: '50%', tx: '-50%', ty: '-50%' },
  'top-end': { top: '0', right: '0', tx: '50%', ty: '-50%' },
  'middle-start': { top: '50%', left: '0', tx: '-50%', ty: '-50%' },
  'middle-center': { top: '50%', left: '50%', tx: '-50%', ty: '-50%' },
  'middle-end': { top: '50%', right: '0', tx: '50%', ty: '-50%' },
  'bottom-start': { bottom: '0', left: '0', tx: '-50%', ty: '50%' },
  'bottom-center': { bottom: '0', left: '50%', tx: '-50%', ty: '50%' },
  'bottom-end': { bottom: '0', right: '0', tx: '50%', ty: '50%' },
};

// `start` lands on the right and `end` on the left; the horizontal pull and
// the offset turn around with them.
function mirror(config: PlacementConfig): PlacementConfig {
  const { left, right, tx, ...rest } = config;
  if (left === '50%') return config;
  return { ...rest, left: right, right: left, tx: negate(tx) };
}

function negate(value: string): string {
  return value.startsWith('-') ? value.slice(1) : `-${value}`;
}

function resolveOffset(value: string): string {
  if (!value || value === '0') return '0px';
  return /^\d+(\.\d+)?$/.test(value.trim()) ? `${value}px` : value;
}

export class LuiFloat extends LitElement {
  static styles = unsafeCSS(styles);

  @property() placement = 'bottom-end';
  @property({ attribute: 'offset-x' }) offsetX = '0';
  @property({ attribute: 'offset-y' }) offsetY = '0';

  // A `dir` change re-runs `updated()`, which mirrors the placement.
  private _direction = new DirectionController(this);

  updated() {
    const placement = PLACEMENTS[this.placement] ?? PLACEMENTS['bottom-end'];
    const rtl = isRtl(this);
    const config = rtl ? mirror(placement) : placement;

    this.style.removeProperty('--lui-float-top');
    this.style.removeProperty('--lui-float-right');
    this.style.removeProperty('--lui-float-bottom');
    this.style.removeProperty('--lui-float-left');

    if (config.top !== undefined)
      this.style.setProperty('--lui-float-top', config.top);
    if (config.right !== undefined)
      this.style.setProperty('--lui-float-right', config.right);
    if (config.bottom !== undefined)
      this.style.setProperty('--lui-float-bottom', config.bottom);
    if (config.left !== undefined)
      this.style.setProperty('--lui-float-left', config.left);

    this.style.setProperty('--lui-float-tx', config.tx);
    this.style.setProperty('--lui-float-ty', config.ty);
    const offsetX = resolveOffset(this.offsetX);
    this.style.setProperty(
      '--lui-float-offset-x',
      rtl ? `calc(${offsetX} * -1)` : offsetX
    );
    this.style.setProperty('--lui-float-offset-y', resolveOffset(this.offsetY));
  }

  render() {
    return html`
      <slot></slot>
      <div class="float__anchor" part="anchor">
        <slot name="float"></slot>
      </div>
    `;
  }
}
