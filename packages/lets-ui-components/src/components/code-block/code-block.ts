import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { property, state } from 'lit/decorators.js';
import styles from './code-block.scss?inline';

// A failure asks the reader to do something, so it stays up longer than a
// confirmation that only reports.
const COPY_FEEDBACK_MS = { copied: 2000, failed: 5000 };

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
    .replace(/&nbsp;/g, '\u00a0')
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

/**
 * Turns code into HTML whose spans carry highlight.js class names
 * (`hljs-keyword`, `hljs-string`, …). The returned HTML is rendered as is, so
 * it must escape the code it was given, as highlight.js does. Returning `null`
 * leaves the block plain — for a language the highlighter does not know.
 */
export type CodeHighlighter = (code: string, language: string) => string | null;

let highlighter: CodeHighlighter | null = null;
const instances = new Set<LuiCodeBlock>();

export class LuiCodeBlock extends LitElement {
  static styles = unsafeCSS(styles);

  // One highlighter for the whole page, so the package carries no parser of
  // its own. Setting it re-renders the blocks already on the page.
  static get highlighter(): CodeHighlighter | null {
    return highlighter;
  }

  static set highlighter(value: CodeHighlighter | null) {
    highlighter = value;
    instances.forEach((block) => block.requestUpdate());
  }

  // The tooltip covers code below the button, so Escape has to put it away
  // without the reader moving the pointer or the focus (WCAG 1.4.13). The
  // listener sits on the document because a hovering pointer leaves the focus
  // wherever it was. One listener serves every block on the page.
  private static _handleEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    instances.forEach((block) => block._dismissTooltip());
  };

  @property() variant = 'default';
  @property() label = '';
  @property() language = '';
  @property({ type: Boolean, attribute: 'show-line-numbers' })
  showLineNumbers = false;
  @property({ attribute: 'show-icon', converter: defaultTrue })
  showIcon = true;
  @property({ converter: defaultTrue }) copy = true;
  @property({ attribute: 'copy-label' }) copyLabel = 'Copy code';
  @property({ attribute: 'copied-label' }) copiedLabel = 'Copied!';
  @property({ attribute: 'copy-failed-label' })
  copyFailedLabel = 'Press Ctrl+C or ⌘C to copy';
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  @state() private _code = '';
  @state() private _copyState: 'idle' | 'copied' | 'failed' = 'idle';
  @state() private _status = '';
  @state() private _tooltipDismissed = false;

  // Highlighting re-tokenises the whole code, so it runs only when the code,
  // the language or the highlighter changes — not on every copy or hover.
  private _highlighted: string | null = null;
  private _highlightedFrom?: {
    code: string;
    language: string;
    highlighter: CodeHighlighter | null;
  };

  private _mutationObserver = new MutationObserver(() => this._readSource());
  private _resizeObserver = new ResizeObserver(() => this._measure());
  private _copyTimer?: ReturnType<typeof setTimeout>;

  get _variant(): 'default' | 'snippet' {
    return this.variant === 'snippet' ? 'snippet' : 'default';
  }

  /** The code as shown and copied: dedented, without surrounding blank lines. */
  get code() {
    return this._code;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!instances.size) {
      document.addEventListener('keydown', LuiCodeBlock._handleEscape);
    }
    instances.add(this);
    this._readSource();
    this._mutationObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    instances.delete(this);
    if (!instances.size) {
      document.removeEventListener('keydown', LuiCodeBlock._handleEscape);
    }
    this._mutationObserver.disconnect();
    this._resizeObserver.disconnect();
    clearTimeout(this._copyTimer);
  }

  firstUpdated() {
    const pre = this.shadowRoot?.querySelector('pre');
    if (pre) this._resizeObserver.observe(pre);
  }

  willUpdate() {
    const from = this._highlightedFrom;
    if (
      from?.code !== this._code ||
      from.language !== this.language ||
      from.highlighter !== highlighter
    ) {
      this._highlighted = this._highlight();
      this._highlightedFrom = {
        code: this._code,
        language: this.language,
        highlighter,
      };
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('_code') || changed.has('showLineNumbers')) {
      this._measure();
    }
  }

  // A `<script type="text/plain">` is never parsed, so its text is the source
  // byte for byte. A `<template>` is parsed and serialised back, which loses
  // line breaks inside tags but lets the code itself contain a `</script>`.
  // Plain text skips slotted children, so an icon's text never ends up in the
  // code.
  private _readSource() {
    const script = this.querySelector(':scope > script[type="text/plain"]');
    const template = this.querySelector(':scope > template');
    let source: string;
    if (script) source = script.textContent ?? '';
    else if (template) source = unescapeSerialized(template.innerHTML);
    else {
      source = Array.from(this.childNodes)
        .filter(
          (node) =>
            node.nodeType === Node.TEXT_NODE ||
            (node instanceof Element && !node.hasAttribute('slot'))
        )
        .map((node) => node.textContent ?? '')
        .join('');
    }
    this._code = normalizeCode(source);
  }

  // A region the keyboard cannot reach cannot be scrolled from the keyboard,
  // so the code takes a tab stop only while its lines overflow. The attribute
  // is set here rather than through a reactive property: measuring happens
  // after a render, and a property would ask for a second one.
  private _measure() {
    const pre = this.shadowRoot?.querySelector('pre');
    if (!pre) return;
    if (pre.scrollWidth > pre.clientWidth) pre.setAttribute('tabindex', '0');
    else pre.removeAttribute('tabindex');
  }

  // Without a highlighter or a language there is nothing to colour. A
  // highlighter that throws — an unregistered language, say — leaves the code
  // plain rather than leaving the block empty.
  private _highlight(): string | null {
    if (!highlighter || !this.language || !this._code) return null;
    try {
      return highlighter(this._code, this.language);
    } catch {
      return null;
    }
  }

  private _dismissTooltip() {
    const copy = this.shadowRoot?.querySelector('.code-block__copy');
    if (copy?.matches(':hover, :focus-within')) this._tooltipDismissed = true;
  }

  private _restoreTooltip() {
    this._tooltipDismissed = false;
  }

  private async _handleCopy() {
    try {
      await navigator.clipboard.writeText(this._code);
    } catch (error) {
      // Selecting the code makes the shortcut the message asks for work.
      const code = this.shadowRoot?.querySelector('code');
      if (code) window.getSelection()?.selectAllChildren(code);
      this._showCopyFeedback('failed');
      this.dispatchEvent(
        new CustomEvent('lui-copy-error', {
          bubbles: true,
          composed: true,
          detail: { error },
        })
      );
      return;
    }

    this._showCopyFeedback('copied');
    this.dispatchEvent(
      new CustomEvent('lui-copy', {
        bubbles: true,
        composed: true,
        detail: { code: this._code },
      })
    );
  }

  private async _showCopyFeedback(state: 'copied' | 'failed') {
    // Cleared before the await below: an earlier copy's timer firing during
    // it would otherwise reset the state this copy is about to show.
    clearTimeout(this._copyTimer);
    this._copyState = state;
    this._tooltipDismissed = false;

    // A live region speaks only when its text changes. Emptying it first lets
    // a second copy in a row be announced like the first.
    this._status = '';
    await this.updateComplete;
    this._status = state === 'copied' ? this.copiedLabel : this.copyFailedLabel;

    this._copyTimer = setTimeout(() => {
      this._copyState = 'idle';
      this._status = '';
    }, COPY_FEEDBACK_MS[state]);
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
    const tooltip = {
      idle: this.copyLabel,
      copied: this.copiedLabel,
      failed: this.copyFailedLabel,
    }[this._copyState];
    // With several blocks on a page, the label tells their buttons apart.
    const name = this.label
      ? `${this.copyLabel}: ${this.label}`
      : this.copyLabel;

    return html`
      <span
        class="code-block__copy tooltip tooltip--bottom ${this._tooltipDismissed
          ? 'code-block__copy--dismissed'
          : ''}"
        @pointerleave="${this._restoreTooltip}"
        @focusout="${this._restoreTooltip}"
      >
        <lui-icon-button
          size="lg"
          aria-label="${name}"
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
    const highlighted = this._highlighted;
    const content = highlighted !== null ? unsafeHTML(highlighted) : this._code;
    const codeClass = this.language ? `language-${this.language}` : undefined;
    // Every block is a region, so each needs its own name: the label tells
    // them apart in a screen reader's list of landmarks.
    const regionName =
      this.ariaLabel ||
      (this.label ? `Code snippet: ${this.label}` : 'Code snippet');
    // A labelled snippet aligns the button to the whole block, label
    // included, which already leaves room for it.
    const singleLine =
      lineCount <= 1 && !(this._variant === 'snippet' && this.label);
    const classes = [
      'code-block',
      `code-block--${this._variant}`,
      this.copy ? 'code-block--copy' : '',
      singleLine ? 'code-block--single-line' : '',
      highlighted !== null ? 'code-block--highlighted' : '',
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
            aria-label="${regionName}"
            translate="no"
          ><code class="${ifDefined(codeClass)}">${content}</code></pre>
          ${this._renderCopy()}
        </div>
        <span class="code-block__status" role="status">${this._status}</span>
      </div>
    `;
  }
}
