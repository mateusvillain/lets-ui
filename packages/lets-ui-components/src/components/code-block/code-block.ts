import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, state } from 'lit/decorators.js';
import styles from './code-block.scss?inline';

const COPIED_RESET_MS = 2000;

const fileIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  viewBox="0 0 16 16"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
>
  <path
    d="M13 14C13 14.2652 12.8945 14.5195 12.707 14.707C12.5195 14.8946 12.2652 15 12 15H4C3.7348 15 3.48047 14.8946 3.293 14.707C3.10547 14.5195 3 14.2652 3 14V2C3 1.7348 3.10547 1.48053 3.293 1.293C3.48047 1.1054 3.7348 1 4 1H9.5C9.6326 1 9.75973 1.05273 9.85353 1.14647L12.8535 4.14647C12.9473 4.24027 13 4.3674 13 4.5V14ZM11.293 4L10 2.707V4H11.293ZM4 14H12V5H10C9.7348 5 9.48047 4.8946 9.293 4.707C9.10547 4.51947 9 4.2652 9 4V2H4V14Z"
  />
</svg>`;

const copyIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
>
  <path
    d="M9 9V19.5H19.5V9H9ZM15 5.25V4.5H4.5V15H5.25C5.6642 15 6 15.3358 6 15.75C6 16.1642 5.6642 16.5 5.25 16.5H4.5C4.1022 16.5 3.7207 16.3419 3.4395 16.0605C3.1582 15.7792 3 15.3978 3 15V4.5C3 4.1022 3.1582 3.7208 3.4395 3.4395C3.7207 3.1581 4.1022 3 4.5 3H15C15.3978 3 15.7793 3.1581 16.0605 3.4395C16.3418 3.7208 16.5 4.1022 16.5 4.5V5.25C16.5 5.6642 16.1642 6 15.75 6C15.3358 6 15 5.6642 15 5.25ZM21 19.5C21 19.8978 20.8418 20.2792 20.5605 20.5605C20.2793 20.8419 19.8978 21 19.5 21H9C8.6022 21 8.2207 20.8419 7.9395 20.5605C7.6582 20.2792 7.5 19.8978 7.5 19.5V9C7.5 8.6022 7.6582 8.2208 7.9395 7.9395C8.2207 7.6581 8.6022 7.5 9 7.5H19.5C19.8978 7.5 20.2793 7.6581 20.5605 7.9395C20.8418 8.2208 21 8.6022 21 9V19.5Z"
  />
</svg>`;

// Absent means on; only the literal `"false"` turns these off, so the
// attribute can default to true and still be switched from markup.
const defaultTrue = {
  fromAttribute: (value: string | null) => value !== 'false',
};

// A `<template>` keeps markup inert, but reading it back serialises it, and
// serialising escapes these characters in text and attributes.
function unescapeSerialized(source: string) {
  return source
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

// Source written inside HTML carries the indentation of the markup around it
// and the blank lines next to the tags. Neither belongs to the code.
export function normalizeCode(source: string) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)![0].length);
  const indent = indents.length ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(indent)).join('\n');
}

export class LuiCodeBlock extends LitElement {
  static styles = unsafeCSS(styles);

  @property() variant = 'default';
  @property() label = '';
  @property({ type: Boolean, attribute: 'show-line-numbers' })
  showLineNumbers = false;
  @property({ attribute: 'show-icon', converter: defaultTrue })
  showIcon = true;
  @property({ converter: defaultTrue }) copy = true;
  @property({ attribute: 'copy-label' }) copyLabel = 'Copy code';
  @property({ attribute: 'copied-label' }) copiedLabel = 'Copied!';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  @state() private _code = '';
  @state() private _copied = false;
  @state() private _scrollable = false;

  private _mutationObserver = new MutationObserver(() => this._readSource());
  private _resizeObserver = new ResizeObserver(() => this._measure());
  private _copiedTimer?: ReturnType<typeof setTimeout>;

  get _variant(): 'default' | 'snippet' {
    return this.variant === 'snippet' ? 'snippet' : 'default';
  }

  /** The code as shown and copied: dedented, without surrounding blank lines. */
  get code() {
    return this._code;
  }

  connectedCallback() {
    super.connectedCallback();
    this._readSource();
    this._mutationObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._mutationObserver.disconnect();
    this._resizeObserver.disconnect();
    clearTimeout(this._copiedTimer);
  }

  firstUpdated() {
    const pre = this.shadowRoot?.querySelector('pre');
    if (pre) this._resizeObserver.observe(pre);
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('_code') || changed.has('showLineNumbers')) {
      this._measure();
    }
  }

  // A `<script type="text/plain">` is never parsed, so its text is the source
  // byte for byte. A `<template>` is parsed and serialised back, which loses
  // line breaks inside tags but lets the code itself contain a `</script>`.
  private _readSource() {
    const script = this.querySelector(':scope > script[type="text/plain"]');
    const template = this.querySelector(':scope > template');
    let source = this.textContent ?? '';
    if (script) source = script.textContent ?? '';
    else if (template) source = unescapeSerialized(template.innerHTML);
    this._code = normalizeCode(source);
  }

  // A region the keyboard cannot reach cannot be scrolled from the keyboard,
  // so the code takes a tab stop only while its lines overflow.
  private _measure() {
    const pre = this.shadowRoot?.querySelector('pre');
    if (!pre) return;
    this._scrollable = pre.scrollWidth > pre.clientWidth;
  }

  private async _handleCopy() {
    try {
      await navigator.clipboard.writeText(this._code);
    } catch {
      return;
    }

    this._copied = true;
    clearTimeout(this._copiedTimer);
    this._copiedTimer = setTimeout(() => {
      this._copied = false;
    }, COPIED_RESET_MS);

    this.dispatchEvent(
      new CustomEvent('lui-copy', {
        bubbles: true,
        composed: true,
        detail: { code: this._code },
      })
    );
  }

  private _renderHeader() {
    if (!this.label) return nothing;
    const withIcon = this._variant === 'default' && this.showIcon;

    return html`
      <div class="code-block__header">
        ${withIcon
          ? html`<span class="code-block__icon"
              ><slot name="icon">${fileIcon}</slot></span
            >`
          : nothing}
        <p class="code-block__label">${this.label}</p>
      </div>
    `;
  }

  private _renderCopy() {
    if (!this.copy) return nothing;
    const tooltip = this._copied ? this.copiedLabel : this.copyLabel;

    return html`
      <span class="code-block__copy tooltip tooltip--bottom">
        <lui-icon-button
          size="lg"
          aria-label="${this.copyLabel}"
          @click="${this._handleCopy}"
        >
          ${copyIcon}
        </lui-icon-button>
        <span class="tooltip__content" aria-hidden="true">${tooltip}</span>
      </span>
    `;
  }

  render() {
    const lineCount = this._code ? this._code.split('\n').length : 0;
    const classes = [
      'code-block',
      `code-block--${this._variant}`,
      this.copy ? 'code-block--copy' : '',
    ].join(' ');

    return html`
      <div class="${classes}">
        ${this._renderHeader()}
        <div class="code-block__body">
          ${this.showLineNumbers
            ? html`<span class="code-block__lines" aria-hidden="true"
                >${Array.from({ length: lineCount }, (_, i) => i + 1).join(
                  '\n'
                )}</span
              >`
            : nothing}
          <pre
            class="code-block__pre"
            role="region"
            aria-label="${this.ariaLabel || 'Code snippet'}"
            tabindex="${ifDefined(this._scrollable ? '0' : undefined)}"
          ><code>${this._code}</code></pre>
          ${this._renderCopy()}
        </div>
        <span class="code-block__status" role="status"
          >${this._copied ? this.copiedLabel : ''}</span
        >
      </div>
    `;
  }
}
