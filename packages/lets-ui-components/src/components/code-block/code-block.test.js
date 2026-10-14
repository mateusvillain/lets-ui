import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiCodeBlock, normalizeCode } from './code-block.ts';
import { LuiIconButton } from '../icon-button/icon-button.ts';

// Only the element under test and the button it renders: the full index would
// pull in every component and the Sass each one inlines.
customElements.define('lui-code-block', LuiCodeBlock);
customElements.define('lui-icon-button', LuiIconButton);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const block = host.querySelector('lui-code-block');
  await block.updateComplete;
  return block;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
  vi.restoreAllMocks();
});

const pre = (block) => block.shadowRoot.querySelector('pre');
const lines = (block) => block.shadowRoot.querySelector('.code-block__lines');
const copyButton = (block) => block.shadowRoot.querySelector('lui-icon-button');
const status = (block) => block.shadowRoot.querySelector('[role="status"]');

describe('normalizeCode', () => {
  it('drops surrounding blank lines and the common indentation', () => {
    expect(normalizeCode('\n    a\n      b\n    c\n  ')).toBe('a\n  b\nc');
  });

  it('ignores blank lines when measuring the indentation', () => {
    expect(normalizeCode('  a\n\n  b')).toBe('a\n\nb');
  });

  it('returns an empty string for blank input', () => {
    expect(normalizeCode('  \n  ')).toBe('');
  });
});

describe('lui-code-block content', () => {
  it('renders the slotted text inside pre > code', async () => {
    const block = await mount(`
      <lui-code-block>
        npm install @lets-ui/styles
      </lui-code-block>
    `);
    expect(pre(block).querySelector('code').textContent).toBe(
      'npm install @lets-ui/styles'
    );
  });

  it('reads a template verbatim, markup included', async () => {
    const block = await mount(`
      <lui-code-block>
        <template>
          <lui-button variant="primary">Save &amp; close</lui-button>
        </template>
      </lui-code-block>
    `);
    expect(block.code).toBe(
      '<lui-button variant="primary">Save & close</lui-button>'
    );
  });

  it('reads a text/plain script byte for byte', async () => {
    const block = await mount(`
      <lui-code-block>
        <script type="text/plain">
          <lui-button
            disabled
          >Save &amp; close</lui-button>
        </script>
      </lui-code-block>
    `);
    expect(block.code).toBe(
      '<lui-button\n  disabled\n>Save &amp; close</lui-button>'
    );
  });

  it('leaves the text of a slotted icon out of the code', async () => {
    const block = await mount(`
      <lui-code-block label="a.ts">
        <span slot="icon">description</span>
        npm install x
      </lui-code-block>
    `);
    expect(block.code).toBe('npm install x');
  });

  it('keeps a non-breaking space from a template', async () => {
    const block = await mount(
      '<lui-code-block><template>a&nbsp;b</template></lui-code-block>'
    );
    expect(block.code).toBe('a\u00a0b');
  });

  it('follows changes to the slotted text', async () => {
    const block = await mount('<lui-code-block>one</lui-code-block>');
    block.textContent = 'two';
    await new Promise((resolve) => setTimeout(resolve));
    await block.updateComplete;
    expect(block.code).toBe('two');
  });
});

describe('lui-code-block markup', () => {
  it('labels the code as a region', async () => {
    const block = await mount('<lui-code-block>x</lui-code-block>');
    expect(pre(block).getAttribute('role')).toBe('region');
    expect(pre(block).getAttribute('aria-label')).toBe('Code snippet');
  });

  it('gives each region its own name from the label, unless aria-label is set', async () => {
    const labelled = await mount(
      '<lui-code-block label="main.js">x</lui-code-block>'
    );
    expect(pre(labelled).getAttribute('aria-label')).toBe(
      'Code snippet: main.js'
    );

    const named = await mount(
      '<lui-code-block label="main.js" aria-label="Install command">x</lui-code-block>'
    );
    expect(pre(named).getAttribute('aria-label')).toBe('Install command');
  });

  it('keeps translators away from the code', async () => {
    const block = await mount('<lui-code-block>return x</lui-code-block>');
    expect(pre(block).getAttribute('translate')).toBe('no');
  });

  it('takes a tab stop only when the code overflows', async () => {
    const short = await mount('<lui-code-block>x</lui-code-block>');
    expect(pre(short).hasAttribute('tabindex')).toBe(false);

    const long = await mount(
      `<lui-code-block style="width: 200px">${'x'.repeat(400)}</lui-code-block>`
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await long.updateComplete;
    expect(pre(long).getAttribute('tabindex')).toBe('0');
  });

  it('shows the header only with a label', async () => {
    const bare = await mount('<lui-code-block>x</lui-code-block>');
    expect(bare.shadowRoot.querySelector('.code-block__header')).toBeNull();

    const labelled = await mount(
      '<lui-code-block label="Component.jsx">x</lui-code-block>'
    );
    expect(
      labelled.shadowRoot.querySelector('.code-block__label').textContent
    ).toBe('Component.jsx');
    expect(
      labelled.shadowRoot.querySelector('.code-block__icon')
    ).not.toBeNull();
  });

  it('hides the icon with show-icon="false" and in the snippet variant', async () => {
    const hidden = await mount(
      '<lui-code-block label="a" show-icon="false">x</lui-code-block>'
    );
    expect(hidden.shadowRoot.querySelector('.code-block__icon')).toBeNull();

    const snippet = await mount(
      '<lui-code-block label="bash" variant="snippet">x</lui-code-block>'
    );
    expect(snippet.shadowRoot.querySelector('.code-block__icon')).toBeNull();
  });

  it('numbers one line per line of code, hidden from screen readers', async () => {
    const block = await mount(`
      <lui-code-block show-line-numbers>
        a
        b
        c
      </lui-code-block>
    `);
    expect(lines(block).textContent).toBe('1\n2\n3');
    expect(lines(block).getAttribute('aria-hidden')).toBe('true');
  });

  it('marks a single line, except in a labelled snippet', async () => {
    const root = (block) => block.shadowRoot.querySelector('.code-block');

    const single = await mount(
      '<lui-code-block>npm run build</lui-code-block>'
    );
    expect(root(single).classList.contains('code-block--single-line')).toBe(
      true
    );

    const multi = await mount('<lui-code-block>a\nb</lui-code-block>');
    expect(root(multi).classList.contains('code-block--single-line')).toBe(
      false
    );

    const snippet = await mount(
      '<lui-code-block variant="snippet" label="bash">x</lui-code-block>'
    );
    expect(root(snippet).classList.contains('code-block--single-line')).toBe(
      false
    );
  });

  it('centres the copy button inside a single line', async () => {
    const block = await mount('<lui-code-block>npm run build</lui-code-block>');
    const body = block.shadowRoot
      .querySelector('.code-block__body')
      .getBoundingClientRect();
    const button = copyButton(block).getBoundingClientRect();

    expect(button.top).toBeGreaterThanOrEqual(body.top);
    expect(button.bottom).toBeLessThanOrEqual(body.bottom);
    expect(
      Math.abs(button.top + button.height / 2 - (body.top + body.height / 2))
    ).toBeLessThan(1);
  });

  it('has no line numbers by default', async () => {
    const block = await mount('<lui-code-block>a</lui-code-block>');
    expect(lines(block)).toBeNull();
  });
});

describe('lui-code-block copy', () => {
  it('renders the copy button by default and drops it with copy="false"', async () => {
    const block = await mount('<lui-code-block>x</lui-code-block>');
    expect(copyButton(block).getAttribute('aria-label')).toBe('Copy code');

    const without = await mount(
      '<lui-code-block copy="false">x</lui-code-block>'
    );
    expect(copyButton(without)).toBeNull();
  });

  it('writes the code to the clipboard and confirms it', async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue();
    const block = await mount(`
      <lui-code-block>
        line one
        line two
      </lui-code-block>
    `);
    const onCopy = vi.fn();
    block.addEventListener('lui-copy', onCopy);

    copyButton(block).click();
    await vi.waitFor(() => expect(onCopy).toHaveBeenCalled());
    await block.updateComplete;

    expect(writeText).toHaveBeenCalledWith('line one\nline two');
    expect(onCopy.mock.calls[0][0].detail.code).toBe('line one\nline two');
    expect(status(block).textContent).toBe('Copied!');
    expect(
      block.shadowRoot.querySelector('.tooltip__content').textContent
    ).toBe('Copied!');
  });

  it('asks for the shortcut and selects the code when the clipboard refuses', async () => {
    const error = new Error('denied');
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(error);
    const block = await mount('<lui-code-block>npm test</lui-code-block>');
    const onCopy = vi.fn();
    const onError = vi.fn();
    block.addEventListener('lui-copy', onCopy);
    block.addEventListener('lui-copy-error', onError);

    copyButton(block).click();
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    await vi.waitFor(() =>
      expect(status(block).textContent).toBe('Press Ctrl+C or ⌘C to copy')
    );

    expect(onCopy).not.toHaveBeenCalled();
    expect(onError.mock.calls[0][0].detail.error).toBe(error);
    expect(
      block.shadowRoot.querySelector('.tooltip__content').textContent
    ).toBe('Press Ctrl+C or ⌘C to copy');
    expect(window.getSelection().toString()).toBe('npm test');
  });

  it('announces every copy, not only the first', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const block = await mount('<lui-code-block>x</lui-code-block>');
    const announced = [];
    new MutationObserver(() =>
      announced.push(status(block).textContent)
    ).observe(status(block), {
      childList: true,
      subtree: true,
      characterData: true,
    });

    copyButton(block).click();
    await vi.waitFor(() => expect(status(block).textContent).toBe('Copied!'));
    copyButton(block).click();
    await vi.waitFor(() =>
      expect(announced.filter((text) => text === 'Copied!')).toHaveLength(2)
    );
  });

  it('names the copy button after the label', async () => {
    const block = await mount(
      '<lui-code-block label="main.js">x</lui-code-block>'
    );
    expect(copyButton(block).getAttribute('aria-label')).toBe(
      'Copy code: main.js'
    );
  });
});

describe('lui-code-block tooltip', () => {
  const copy = (block) => block.shadowRoot.querySelector('.code-block__copy');
  const tooltip = (block) =>
    block.shadowRoot.querySelector('.tooltip__content');
  const visible = (block) => getComputedStyle(tooltip(block)).visibility;

  it('puts the tooltip away on Escape and brings it back on the next focus', async () => {
    const block = await mount('<lui-code-block>x</lui-code-block>');
    const button = copyButton(block).shadowRoot.querySelector('button');

    button.focus();
    await block.updateComplete;
    expect(visible(block)).toBe('visible');

    await userEvent.keyboard('{Escape}');
    await block.updateComplete;
    expect(copy(block).classList).toContain('code-block__copy--dismissed');
    expect(visible(block)).toBe('hidden');

    button.blur();
    await block.updateComplete;
    expect(copy(block).classList).not.toContain('code-block__copy--dismissed');
  });

  it('puts away only the tooltip that is showing', async () => {
    const first = await mount('<lui-code-block>a</lui-code-block>');
    const second = await mount('<lui-code-block>b</lui-code-block>');
    copyButton(first).shadowRoot.querySelector('button').focus();

    await userEvent.keyboard('{Escape}');
    await Promise.all([first.updateComplete, second.updateComplete]);

    expect(copy(first).classList).toContain('code-block__copy--dismissed');
    expect(copy(second).classList).not.toContain('code-block__copy--dismissed');
  });

  it('keeps the tooltip inside the block', async () => {
    const block = await mount(
      '<lui-code-block copied-label="A much longer confirmation message">x</lui-code-block>'
    );
    copyButton(block).shadowRoot.querySelector('button').focus();
    await block.updateComplete;
    const tip = tooltip(block).getBoundingClientRect();
    const host = block.getBoundingClientRect();
    expect(tip.right).toBeLessThanOrEqual(host.right);
  });

  it('ignores Escape while the tooltip is not showing', async () => {
    const block = await mount('<lui-code-block>x</lui-code-block>');
    await userEvent.keyboard('{Escape}');
    await block.updateComplete;
    expect(copy(block).classList).not.toContain('code-block__copy--dismissed');
  });

  it('lets the pointer move onto the tooltip', async () => {
    const block = await mount('<lui-code-block>x</lui-code-block>');
    await userEvent.hover(copyButton(block));
    expect(getComputedStyle(tooltip(block)).pointerEvents).toBe('auto');
  });
});

describe('lui-code-block highlighting', () => {
  // Stands in for highlight.js: escapes the code and wraps every word in a
  // keyword span, which is all the component needs to see.
  const fake = (code) =>
    code
      .split(/(\w+)/)
      .map((part, i) =>
        i % 2
          ? `<span class="hljs-keyword">${part}</span>`
          : part.replace(/&/g, '&amp;').replace(/</g, '&lt;')
      )
      .join('');

  const code = (block) => block.shadowRoot.querySelector('code');
  const isHighlighted = (block) =>
    block.shadowRoot
      .querySelector('.code-block')
      .classList.contains('code-block--highlighted');

  afterEach(() => {
    LuiCodeBlock.highlighter = null;
  });

  it('stays plain without a highlighter', async () => {
    const block = await mount(
      '<lui-code-block language="js">const a</lui-code-block>'
    );
    expect(code(block).querySelector('span')).toBeNull();
    expect(isHighlighted(block)).toBe(false);
  });

  it('stays plain without a language', async () => {
    LuiCodeBlock.highlighter = fake;
    const block = await mount('<lui-code-block>const a</lui-code-block>');
    expect(code(block).querySelector('span')).toBeNull();
  });

  it('renders the highlighter output and keeps copying the raw code', async () => {
    const highlighter = vi.fn(fake);
    LuiCodeBlock.highlighter = highlighter;
    const block = await mount(
      '<lui-code-block language="js">const a &lt; b</lui-code-block>'
    );

    expect(highlighter).toHaveBeenCalledWith('const a < b', 'js');
    expect(code(block).querySelectorAll('.hljs-keyword')).toHaveLength(3);
    expect(code(block).textContent).toBe('const a < b');
    expect(code(block).className).toBe('language-js');
    expect(isHighlighted(block)).toBe(true);
    expect(block.code).toBe('const a < b');
  });

  it('highlights once, not on every copy or hover', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const highlighter = vi.fn(fake);
    LuiCodeBlock.highlighter = highlighter;
    const block = await mount(
      '<lui-code-block language="js">const a</lui-code-block>'
    );
    const calls = highlighter.mock.calls.length;

    copyButton(block).click();
    await vi.waitFor(() =>
      expect(
        block.shadowRoot.querySelector('[role="status"]').textContent
      ).toBe('Copied!')
    );
    await userEvent.hover(copyButton(block));
    await block.updateComplete;

    expect(highlighter.mock.calls.length).toBe(calls);
  });

  it('re-renders blocks already on the page when the highlighter is set', async () => {
    const block = await mount(
      '<lui-code-block language="js">const a</lui-code-block>'
    );
    LuiCodeBlock.highlighter = fake;
    await block.updateComplete;
    expect(code(block).querySelector('.hljs-keyword')).not.toBeNull();
  });

  it('stays plain when the highlighter returns null', async () => {
    LuiCodeBlock.highlighter = () => null;
    const block = await mount(
      '<lui-code-block language="nope">x</lui-code-block>'
    );
    expect(code(block).textContent).toBe('x');
    expect(isHighlighted(block)).toBe(false);
  });

  it('falls back to plain code when the highlighter throws', async () => {
    LuiCodeBlock.highlighter = () => {
      throw new Error('Unknown language');
    };
    const block = await mount(
      '<lui-code-block language="nope">x</lui-code-block>'
    );
    expect(code(block).textContent).toBe('x');
    expect(isHighlighted(block)).toBe(false);
  });

  it('colours the base text and each role from the tokens', async () => {
    LuiCodeBlock.highlighter = fake;
    const block = await mount(
      '<lui-code-block language="js">const</lui-code-block>'
    );
    const pre = block.shadowRoot.querySelector('pre');
    const keyword = code(block).querySelector('.hljs-keyword');

    expect(getComputedStyle(keyword).color).not.toBe(
      getComputedStyle(pre).color
    );
  });
});
