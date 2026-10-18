import '../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiDrawer } from '../components/drawer/drawer.ts';
import { LuiModal } from '../components/modal/modal.ts';

// Only the elements under test: the full index would pull in every
// component and the Sass each one inlines.
customElements.define('lui-modal', LuiModal);
customElements.define('lui-drawer', LuiDrawer);

const mounted = [];

afterEach(() => {
  mounted.splice(0).forEach(({ host, el, close }) => {
    if (el.open) el[close]();
    host.remove();
  });
});

const nextSlotChange = async (el) => {
  // slotchange is dispatched as a microtask after the DOM mutation; one frame
  // lets it and the render it schedules settle.
  await new Promise((r) => requestAnimationFrame(r));
  await el.updateComplete;
};

describe.each([
  {
    tag: 'lui-modal',
    open: 'openModal',
    close: 'closeModal',
    panel: '[data-modal-dialog]',
  },
  {
    tag: 'lui-drawer',
    open: 'openDrawer',
    close: 'closeDrawer',
    panel: '[data-drawer-panel]',
  },
])('$tag trigger ARIA', ({ tag, open, close, panel }) => {
  async function mount(inner = '') {
    const host = document.createElement('div');
    host.innerHTML = `<${tag} title="T">${inner}</${tag}>`;
    document.body.append(host);
    const el = host.querySelector(tag);
    mounted.push({ host, el, close });
    await el.updateComplete;
    await nextSlotChange(el);
    return el;
  }

  it('points the default trigger at the panel in its own shadow root', async () => {
    const el = await mount();
    const trigger = el.shadowRoot.querySelector('button[aria-haspopup]');

    const id = trigger.getAttribute('aria-controls');
    expect(el.shadowRoot.getElementById(id)).toBe(
      el.shadowRoot.querySelector(panel)
    );
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('sets no dangling aria-controls on a slotted trigger', async () => {
    const el = await mount('<button slot="trigger">Open</button>');
    const trigger = el.querySelector('[slot="trigger"]');

    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('leaves a consumer-authored aria-controls untouched', async () => {
    const el = await mount(
      '<button slot="trigger" aria-controls="mine">Open</button>'
    );
    el[open]();
    await el.updateComplete;

    expect(
      el.querySelector('[slot="trigger"]').getAttribute('aria-controls')
    ).toBe('mine');
  });

  it('keeps aria-expanded in sync on a slotted trigger', async () => {
    const el = await mount('<button slot="trigger">Open</button>');
    const trigger = el.querySelector('[slot="trigger"]');

    el[open]();
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    el[close]();
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('targets the first interactive descendant of a wrapper', async () => {
    const el = await mount(`
      <div slot="trigger">
        <span tabindex="-1"></span>
        <button disabled>Off</button>
        <button id="real">Open</button>
      </div>`);

    expect(el.querySelector('#real').getAttribute('aria-haspopup')).toBe(
      'dialog'
    );
    expect(el.querySelector('span').hasAttribute('aria-haspopup')).toBe(false);
    expect(el.querySelector('[disabled]').hasAttribute('aria-haspopup')).toBe(
      false
    );
  });

  it('moves the contract to a swapped-in trigger', async () => {
    const el = await mount('<button slot="trigger" id="a">A</button>');
    const a = el.querySelector('#a');
    const b = document.createElement('button');
    b.slot = 'trigger';
    a.replaceWith(b);
    await nextSlotChange(el);

    expect(b.getAttribute('aria-haspopup')).toBe('dialog');
    expect(b.getAttribute('aria-expanded')).toBe('false');
    expect(a.hasAttribute('aria-haspopup')).toBe(false);
    expect(a.hasAttribute('aria-expanded')).toBe(false);
  });
});
