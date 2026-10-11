import { LitElement, html, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './stepper.scss?inline';
import type { LuiStep, StepStatus } from './step.js';

export class LuiStepper extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Number, attribute: 'current-step', reflect: true })
  currentStep = 1;
  @property({ reflect: true }) orientation = 'horizontal';
  @property({ attribute: 'label-placement' }) labelPlacement = 'end';
  @property({ type: Boolean }) linear = false;
  @property() label = 'Progress';
  @property({ attribute: 'completed-label' }) completedLabel = 'Completed';
  @property({ attribute: 'loading-label' }) loadingLabel = 'Loading';
  @property({ attribute: 'step-label' }) stepLabel = 'Step {step} of {total}';

  // A horizontal stepper that does not fit its container stacks instead of
  // scrolling sideways (WCAG 1.4.10 Reflow).
  @state() private _collapsed = false;
  @state() private _announcement = '';

  // The row width the horizontal layout needed when it last overflowed. The
  // stepper unfolds again only once the container reaches it, so it cannot
  // flip back and forth at the edge.
  private _neededWidth = 0;
  private _frame = 0;
  private _resizeObserver?: ResizeObserver;

  constructor() {
    super();
    this.addEventListener('lui-step-select', this._handleSelect);
  }

  connectedCallback() {
    super.connectedCallback();
    // Created on connect, not as a field initializer: constructing the element
    // must not need `ResizeObserver`, which a Node or jsdom import does not have.
    if (typeof ResizeObserver === 'undefined') return;
    this._resizeObserver = new ResizeObserver(this._scheduleMeasure);
    this._resizeObserver.observe(this);
    this._steps.forEach((step) => this._resizeObserver?.observe(step));
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    cancelAnimationFrame(this._frame);
    super.disconnectedCallback();
  }

  get _orientation(): 'horizontal' | 'vertical' {
    return this.orientation === 'vertical' || this._collapsed
      ? 'vertical'
      : 'horizontal';
  }

  // Measured a frame later rather than inside the observer callback: switching
  // the layout resizes what is being observed, and doing it in the same frame
  // would trip the browser's ResizeObserver loop error.
  private _scheduleMeasure = () => {
    cancelAnimationFrame(this._frame);
    this._frame = requestAnimationFrame(() => this._measure());
  };

  private _measure() {
    if (this.orientation === 'vertical') {
      this._collapsed = false;
      return;
    }
    const list = this.shadowRoot?.querySelector<HTMLElement>('.stepper');
    if (!list) return;

    if (!this._collapsed) {
      if (list.scrollWidth > list.clientWidth + 1) {
        this._neededWidth = list.scrollWidth;
        this._collapsed = true;
      }
    } else if (list.clientWidth >= this._neededWidth) {
      this._collapsed = false;
    }
  }

  // Labels below the indicator only make sense in a row: in a column there is
  // no room to gain by moving them.
  get _labelsBottom(): boolean {
    return (
      this.labelPlacement === 'bottom' && this._orientation === 'horizontal'
    );
  }

  private get _steps(): LuiStep[] {
    return Array.from(this.children).filter(
      (el): el is LuiStep => el.tagName.toLowerCase() === 'lui-step'
    );
  }

  private get _current(): number {
    const total = this._steps.length;
    return Math.min(Math.max(1, Math.floor(this.currentStep) || 1), total || 1);
  }

  private _position(index: number): string {
    return this.stepLabel
      .replace('{step}', String(index))
      .replace('{total}', String(this._steps.length));
  }

  private _status(index: number): StepStatus {
    const current = this._current;
    if (index < current) return 'completed';
    if (index === current) return 'active';
    return 'upcoming';
  }

  // The steps sit in the light DOM, so everything they draw from their place in
  // the sequence is pushed down here rather than read up from the step.
  private _syncSteps = () => {
    const steps = this._steps;
    const current = this._current;
    steps.forEach((step, i) => {
      const index = i + 1;
      step.index = index;
      step.status = this._status(index);
      step.last = index === steps.length;
      step.navigable = !this.linear || index <= current;
      step.orientation = this._orientation;
      step.labelsBottom = this._labelsBottom;
      step.completedLabel = this.completedLabel;
      step.loadingLabel = this.loadingLabel;
      step.position = this._position(index);
      this._resizeObserver?.observe(step);
    });
  };

  private _handleSelect = (e: Event) => {
    const step = e.target as LuiStep;
    // Ignore the steps of a nested stepper.
    if (!this._steps.includes(step)) return;
    e.stopPropagation();

    const target = step.index;
    if (target === this._current) return;

    // Cancelable so the page can hold the user on a step — an invalid form,
    // say — without the stepper having moved first.
    const proceed = this.dispatchEvent(
      new CustomEvent('lui-step-change', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { step: target, previous: this._current },
      })
    );
    if (proceed) this.currentStep = target;
  };

  // Focus stays on whatever moved the stepper — the step clicked, or a "Next"
  // button outside it — and a change of `aria-current` on another element is
  // not reliably announced, so the new step is spoken through a live region.
  // Not on the first render: arriving on the page is not a change.
  willUpdate(changed: Map<string, unknown>) {
    if (!this.hasUpdated || !changed.has('currentStep')) return;
    const current = this._current;
    const step = this._steps[current - 1];
    const position = this._position(current);
    this._announcement = step?.label ? `${position}, ${step.label}` : position;
  }

  updated() {
    this._syncSteps();
    this._scheduleMeasure();
  }

  render() {
    const classes = [
      'stepper',
      `stepper--${this._orientation}`,
      this._labelsBottom && 'stepper--labels-bottom',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="${classes}" role="list" aria-label="${this.label}">
        <slot @slotchange="${this._syncSteps}"></slot>
      </div>
      <p class="stepper__announcement" role="status">${this._announcement}</p>
    `;
  }
}
