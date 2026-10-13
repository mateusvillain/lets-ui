import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

  it('does not confirm when the clipboard refuses', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied')
    );
    const block = await mount('<lui-code-block>x</lui-code-block>');
    const onCopy = vi.fn();
    block.addEventListener('lui-copy', onCopy);

    copyButton(block).click();
    await new Promise((resolve) => setTimeout(resolve));
    await block.updateComplete;

    expect(onCopy).not.toHaveBeenCalled();
    expect(status(block).textContent).toBe('');
  });
});
