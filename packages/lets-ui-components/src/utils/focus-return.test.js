import '../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiButton } from '../components/button/button.ts';
import { LuiDrawer } from '../components/drawer/drawer.ts';
import { LuiModal } from '../components/modal/modal.ts';

// Only the elements under test: the full index would pull in every
// component and the Sass each one inlines.
customElements.define('lui-modal', LuiModal);
customElements.define('lui-drawer', LuiDrawer);
customElements.define('lui-button', LuiButton);

const mounted = [];

afterEach(() => {
  mounted.splice(0).forEach((host) => {
    host.querySelectorAll('lui-modal, lui-drawer').forEach((el) => {
      el.open = false;
    });
    host.remove();
  });
});

const frame = () => new Promise((r) => requestAnimationFrame(r));

const deepActive = () => {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
};

// The control that actually holds focus: the element itself for a native
// button, the button in its shadow root for a Let's UI one.
const focusable = (el) => el.shadowRoot?.querySelector('button') ?? el;

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  for (const el of host.querySelectorAll('*')) await el.updateComplete;
  // slotchange and the render it schedules.
  await frame();
  for (const el of host.querySelectorAll('*')) await el.updateComplete;
  return host;
}

describe.each([
  {
    tag: 'lui-modal',
    attrs: '',
    panel: '[data-modal-dialog]',
    backdrop: '[data-modal-backdrop]',
  },
  {
    tag: 'lui-drawer',
    attrs: 'close-on-backdrop',
    panel: '[data-drawer-panel]',
    backdrop: '[data-drawer-backdrop]',
  },
])('$tag focus return', ({ tag, attrs, panel, backdrop }) => {
  async function openFrom(control, el) {
    control.focus();
    control.click();
    await el.updateComplete;
    // The panel takes focus on the next frame.
    await frame();
    expect(el.shadowRoot.activeElement).toBe(
      el.shadowRoot.querySelector(panel)
    );
  }

  const closers = {
    Escape: async () => userEvent.keyboard('{Escape}'),
    'the close button': async (el) =>
      el.shadowRoot.querySelector('lui-close-button').click(),
    'a backdrop click': async (el) =>
      el.shadowRoot
        .querySelector(backdrop)
        .dispatchEvent(new MouseEvent('click', { bubbles: true })),
    'the open property': async (el) => {
      el.open = false;
    },
    'removing the open attribute': async (el) => el.removeAttribute('open'),
  };

  describe.each(Object.keys(closers))('closed by %s', (how) => {
    it('returns focus to the default trigger', async () => {
      const host = await mount(
        `<${tag} title="T" ${attrs}><p>Body</p></${tag}>`
      );
      const el = host.querySelector(tag);
      const trigger = el.shadowRoot.querySelector('button[aria-haspopup]');

      await openFrom(trigger, el);
      await closers[how](el);
      await el.updateComplete;

      expect(deepActive()).toBe(trigger);
    });

    it('returns focus to a slotted native button', async () => {
      const host = await mount(
        `<${tag} title="T" ${attrs}><button slot="trigger">Open</button><p>Body</p></${tag}>`
      );
      const el = host.querySelector(tag);
      const trigger = host.querySelector('[slot="trigger"]');

      await openFrom(trigger, el);
      await closers[how](el);
      await el.updateComplete;

      expect(deepActive()).toBe(trigger);
    });

    it('returns focus to a slotted lui-button', async () => {
      const host = await mount(
        `<${tag} title="T" ${attrs}><lui-button slot="trigger" label="Open"></lui-button><p>Body</p></${tag}>`
      );
      const el = host.querySelector(tag);
      const trigger = focusable(host.querySelector('[slot="trigger"]'));

      await openFrom(trigger, el);
      await closers[how](el);
      await el.updateComplete;

      expect(deepActive()).toBe(trigger);
    });
  });

  it('returns focus to an outside opener when opened programmatically', async () => {
    const host = await mount(
      `<button id="opener">Open</button><${tag} title="T" hide-trigger></${tag}>`
    );
    const el = host.querySelector(tag);
    const opener = host.querySelector('#opener');
    opener.addEventListener('click', () => {
      el.open = true;
    });

    await openFrom(opener, el);
    el.open = false;
    await el.updateComplete;

    expect(deepActive()).toBe(opener);
  });

  it('falls back to its trigger when the opener is gone', async () => {
    const host = await mount(
      `<button id="opener">Open</button><${tag} title="T"></${tag}>`
    );
    const el = host.querySelector(tag);
    const opener = host.querySelector('#opener');
    opener.addEventListener('click', () => {
      el.open = true;
    });

    await openFrom(opener, el);
    opener.remove();
    el.open = false;
    await el.updateComplete;

    expect(deepActive()).toBe(
      el.shadowRoot.querySelector('button[aria-haspopup]')
    );
  });

  it('does not throw or move focus when nothing can take it', async () => {
    const host = await mount(
      `<button id="opener">Open</button><${tag} title="T" hide-trigger></${tag}>`
    );
    const el = host.querySelector(tag);
    const opener = host.querySelector('#opener');
    opener.addEventListener('click', () => {
      el.open = true;
    });

    await openFrom(opener, el);
    opener.remove();
    el.open = false;
    await el.updateComplete;

    expect(host.contains(deepActive())).toBe(false);
  });

  it('leaves focus that already moved outside', async () => {
    const host = await mount(
      `<input id="elsewhere"><${tag} title="T"></${tag}>`
    );
    const el = host.querySelector(tag);
    const elsewhere = host.querySelector('#elsewhere');

    await openFrom(el.shadowRoot.querySelector('button[aria-haspopup]'), el);
    elsewhere.focus();
    el.open = false;
    await el.updateComplete;

    expect(deepActive()).toBe(elsewhere);
  });

  it('does not pull focus into a panel closed before its frame', async () => {
    const host = await mount(`<${tag} title="T"></${tag}>`);
    const el = host.querySelector(tag);
    const trigger = el.shadowRoot.querySelector('button[aria-haspopup]');

    trigger.focus();
    trigger.click();
    await el.updateComplete;
    el.open = false;
    await el.updateComplete;
    await frame();

    expect(deepActive()).toBe(trigger);
  });
});

describe('lui-modal opened from another modal', () => {
  it('keeps focus in the second one and returns to the first trigger', async () => {
    const host = await mount(`
      <lui-modal id="a" title="A">
        <button id="next">Next</button>
      </lui-modal>
      <lui-modal id="b" title="B" hide-trigger></lui-modal>
    `);
    const a = host.querySelector('#a');
    const b = host.querySelector('#b');
    const triggerA = a.shadowRoot.querySelector('button[aria-haspopup]');
    host.querySelector('#next').addEventListener('click', () => b.openModal());

    triggerA.focus();
    triggerA.click();
    await a.updateComplete;
    await frame();

    const next = host.querySelector('#next');
    next.focus();
    next.click();
    await a.updateComplete;
    await b.updateComplete;
    await frame();

    expect(a.open).toBe(false);
    expect(b.shadowRoot.activeElement).toBe(
      b.shadowRoot.querySelector('[data-modal-dialog]')
    );

    b.closeModal();
    await b.updateComplete;

    expect(deepActive()).toBe(triggerA);
  });
});
