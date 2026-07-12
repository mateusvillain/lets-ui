import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './toast.scss?inline';

const VALID_VARIANTS = ['default', 'success', 'danger'] as const;
type ToastVariant = (typeof VALID_VARIANTS)[number];

// Every variant ships a built-in outline icon; the `icon` slot lets a
// consumer override it with a custom icon regardless of variant.
const DEFAULT_ICONS: Record<ToastVariant, TemplateResult> = {
  default: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
    />
  </svg>`,
  success: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m9 12.75 2.25 2.25 3-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>`,
  danger: html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>`,
};

// Entry animation length must match .toast--entering in _toast.scss so the
// countdown only starts once the toast is actually visible to the user.
const ENTRY_ANIMATION_MS = 300;
// Exit animation length must match .toast--exiting in _toast.scss so the
// element isn't removed from the DOM mid-animation.
const EXIT_ANIMATION_MS = 200;

export class LuiToast extends LitElement {
  static styles = unsafeCSS(styles);

  @property() variant = 'default';
  @property() title = '';
  // Fallback for the default slot — used only when no light-DOM children are
  // slotted in, so simple text content still works via the attribute alone.
  @property() content = '';
  @property({ type: Number }) duration = 5000;
  @property({ attribute: 'close-label' }) closeLabel = 'Close';

  @state() private _exiting = false;
  @state() private _actionSlotted = false;
  @state() private _contentSlotted = false;

  private _timerId?: ReturnType<typeof setTimeout>;
  private _entryTimerId?: ReturnType<typeof setTimeout>;
  private _remaining = 0;
  private _startedAt = 0;
  private _hovered = false;
  private _focusWithin = false;

  private get _resolvedVariant(): ToastVariant {
    return (VALID_VARIANTS as readonly string[]).includes(this.variant)
      ? (this.variant as ToastVariant)
      : 'default';
  }

  private get _role(): 'status' | 'alert' {
    return this._resolvedVariant === 'danger' ? 'alert' : 'status';
  }

  override firstUpdated() {
    this._startTimer();
  }

  override disconnectedCallback() {
    clearTimeout(this._entryTimerId);
    clearTimeout(this._timerId);
    super.disconnectedCallback();
  }

  private _startTimer() {
    // Danger toasts always require manual dismissal, regardless of
    // `duration` — auto-dismissing errors violates WCAG 2.2.1 (see
    // .study/toast.md §6/§9).
    if (this._resolvedVariant === 'danger') return;
    if (!this.duration || this.duration <= 0) return;

    this._entryTimerId = setTimeout(() => {
      if (this._exiting) return;
      this._remaining = this.duration;
      // Pointer or keyboard focus may have reached the toast while the entry
      // animation was still playing — stay paused; _maybeResume arms the
      // countdown once both leave.
      if (this._hovered || this._focusWithin) return;
      this._startedAt = performance.now();
      this._timerId = setTimeout(() => this._dismiss(), this._remaining);
    }, ENTRY_ANIMATION_MS);
  }

  private _pause() {
    if (this._timerId === undefined) return;
    clearTimeout(this._timerId);
    this._timerId = undefined;
    this._remaining = Math.max(
      this._remaining - (performance.now() - this._startedAt),
      0
    );
  }

  private _resume() {
    if (this._exiting || this._timerId !== undefined) return;
    if (this._resolvedVariant === 'danger') return;
    if (!this.duration || this.duration <= 0 || this._remaining <= 0) return;

    this._startedAt = performance.now();
    this._timerId = setTimeout(() => this._dismiss(), this._remaining);
  }

  private _handleMouseEnter() {
    this._hovered = true;
    this._pause();
  }

  private _handleMouseLeave() {
    this._hovered = false;
    this._maybeResume();
  }

  private _handleFocusIn() {
    this._focusWithin = true;
    this._pause();
  }

  private _handleFocusOut(e: FocusEvent) {
    const related = e.relatedTarget as Node | null;
    // Slotted children (action button, links in the default slot) live in
    // the host's light DOM, not the shadow root — check both trees.
    if (
      related &&
      (this.contains(related) || this.shadowRoot?.contains(related))
    ) {
      return;
    }
    this._focusWithin = false;
    this._maybeResume();
  }

  // Hover and keyboard focus pause the countdown independently — only
  // resume once neither is holding it (WCAG 2.2.1).
  private _maybeResume() {
    if (this._hovered || this._focusWithin) return;
    this._resume();
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') this._dismiss();
  }

  private _handleActionSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._actionSlotted = slot.assignedNodes({ flatten: true }).length > 0;
  }

  // The default slot is unnamed, so it also collects whitespace-only text
  // nodes between the host's other (named) children — checking length alone
  // would permanently hide the `content` fallback. Element nodes (only
  // unnamed children land here, e.g. a text-less <img>) and non-blank text
  // count as "slotted".
  private _handleContentSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._contentSlotted = slot
      .assignedNodes({ flatten: true })
      .some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.textContent ?? '').trim().length > 0
      );
  }

  private _dismiss() {
    if (this._exiting) return;
    clearTimeout(this._entryTimerId);
    clearTimeout(this._timerId);
    this._timerId = undefined;
    this.dispatchEvent(
      new CustomEvent('lui-close', { bubbles: true, composed: true })
    );
    this._exiting = true;
    setTimeout(() => this.remove(), EXIT_ANIMATION_MS);
  }

  render() {
    const variant = this._resolvedVariant;

    return html`
      <div
        class="toast toast--${variant} toast--entering${this._exiting
          ? ' toast--exiting'
          : ''}"
        role="${this._role}"
        aria-atomic="true"
        @mouseenter="${this._handleMouseEnter}"
        @mouseleave="${this._handleMouseLeave}"
        @focusin="${this._handleFocusIn}"
        @focusout="${this._handleFocusOut}"
        @keydown="${this._handleKeydown}"
      >
        <div class="toast__icon">
          <slot name="icon">${DEFAULT_ICONS[variant]}</slot>
        </div>
        <div class="toast__text">
          <p>${this.title}</p>
          <p>
            ${this._contentSlotted ? '' : this.content}<slot
              @slotchange="${this._handleContentSlotChange}"
            ></slot>
          </p>
        </div>
        ${this._actionSlotted
          ? ''
          : html`<lui-close-button
              size="lg"
              label="${this.closeLabel}"
              @click="${this._dismiss}"
            ></lui-close-button>`}
        <div
          class="toast__action"
          style="${this._actionSlotted ? '' : 'display:none'}"
          @click="${this._dismiss}"
        >
          <slot
            name="action"
            @slotchange="${this._handleActionSlotChange}"
          ></slot>
        </div>
      </div>
    `;
  }
}
