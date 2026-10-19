import '../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiDrawer } from '../components/drawer/drawer.ts';
import {
  LuiDropdownMenu,
  LuiMenuItem,
} from '../components/dropdown-menu/dropdown-menu.ts';
import { LuiModal } from '../components/modal/modal.ts';
import { deepActiveElement as deepActive } from './focus-return.ts';

// Only the elements under test: the full index would pull in every
// component and the Sass each one inlines.
customElements.define('lui-modal', LuiModal);
customElements.define('lui-drawer', LuiDrawer);
customElements.define('lui-dropdown-menu', LuiDropdownMenu);
customElements.define('lui-menu-item', LuiMenuItem);

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

// Opens `dialog` from `control`, as a click would, and waits for the panel to
// take focus on the next frame.
async function openFrom(control, dialog) {
  control.focus();
  control.click();
  await dialog.updateComplete;
  await frame();
}

async function escape(...dialogs) {
  await userEvent.keyboard('{Escape}');
  for (const el of dialogs) await el.updateComplete;
}

const defaultTrigger = (el) =>
  el.shadowRoot.querySelector('button[aria-haspopup="dialog"]');

describe.each([
  { inner: 'lui-modal', outer: 'lui-drawer' },
  { inner: 'lui-drawer', outer: 'lui-drawer' },
])('$inner on top of $outer', ({ inner, outer }) => {
  async function stack() {
    const host = await mount(`
      <${outer} title="Outer">
        <${inner} title="Inner">
          <button slot="trigger">Open inner</button>
        </${inner}>
      </${outer}>
    `);
    const outerEl = host.querySelector(outer);
    const innerEl = outerEl.querySelector(inner);
    const innerTrigger = innerEl.querySelector('button[slot="trigger"]');

    await openFrom(defaultTrigger(outerEl), outerEl);
    await openFrom(innerTrigger, innerEl);
    expect(outerEl.open).toBe(true);
    expect(innerEl.open).toBe(true);
    return { outerEl, innerEl, innerTrigger };
  }

  it('closes one dialog per Escape, the top one first', async () => {
    const { outerEl, innerEl } = await stack();

    await escape(innerEl, outerEl);
    expect(innerEl.open).toBe(false);
    expect(outerEl.open).toBe(true);

    await escape(innerEl, outerEl);
    expect(outerEl.open).toBe(false);
  });

  it('returns focus to the opener inside the dialog still open', async () => {
    const { outerEl, innerEl, innerTrigger } = await stack();

    await escape(innerEl, outerEl);
    expect(deepActive()).toBe(innerTrigger);

    await escape(innerEl, outerEl);
    expect(deepActive()).toBe(defaultTrigger(outerEl));
  });

  it('ignores a held Escape after the first press', async () => {
    const { outerEl, innerEl } = await stack();

    await escape(innerEl, outerEl);
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        repeat: true,
        bubbles: true,
        composed: true,
      })
    );
    await outerEl.updateComplete;
    expect(outerEl.open).toBe(true);
  });

  it('hands Escape back to the dialog below once the top one is removed', async () => {
    const { outerEl, innerEl } = await stack();

    innerEl.remove();
    await escape(outerEl);
    expect(outerEl.open).toBe(false);
  });
});

describe.each(['lui-modal', 'lui-drawer'])('a single %s', (tag) => {
  it('still closes on Escape', async () => {
    const host = await mount(`<${tag}></${tag}>`);
    const el = host.querySelector(tag);

    await openFrom(defaultTrigger(el), el);
    await escape(el);
    expect(el.open).toBe(false);
  });

  it('leaves Escape to an open dropdown menu inside it', async () => {
    const host = await mount(`
      <${tag}>
        <lui-dropdown-menu>
          <button slot="trigger">Actions</button>
          <lui-menu-item slot="items" label="Edit"></lui-menu-item>
        </lui-dropdown-menu>
      </${tag}>
    `);
    const el = host.querySelector(tag);
    const menu = el.querySelector('lui-dropdown-menu');
    const menuTrigger = menu.querySelector('button');

    await openFrom(defaultTrigger(el), el);
    menuTrigger.focus();
    menu.open = true;
    await menu.updateComplete;

    await escape(el, menu);
    expect(menu.open).toBe(false);
    expect(el.open).toBe(true);
    expect(deepActive()).toBe(menuTrigger);

    await escape(el, menu);
    expect(el.open).toBe(false);
  });

  it('leaves an Escape that ends an IME composition to the input', async () => {
    const host = await mount(`<${tag}><input /></${tag}>`);
    const el = host.querySelector(tag);
    const input = el.querySelector('input');

    await openFrom(defaultTrigger(el), el);
    input.focus();
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        isComposing: true,
        bubbles: true,
        composed: true,
      })
    );
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  it('closes on Escape over a dropdown menu left open behind it', async () => {
    const host = await mount(`
      <lui-dropdown-menu>
        <button slot="trigger">Actions</button>
        <lui-menu-item slot="items" label="Edit"></lui-menu-item>
      </lui-dropdown-menu>
      <${tag}></${tag}>
    `);
    const el = host.querySelector(tag);
    const menu = host.querySelector('lui-dropdown-menu');

    menu.open = true;
    await menu.updateComplete;
    await frame();
    // Opened by code, as a session timeout would: no click closes the menu.
    el.open = true;
    await el.updateComplete;
    await frame();

    await escape(el, menu);
    expect(el.open).toBe(false);
    expect(menu.open).toBe(false);
  });
});

describe('a lui-modal inside a lui-drawer inside a lui-modal', () => {
  it('keeps the modals around it open', async () => {
    const host = await mount(`
      <lui-modal title="Outer">
        <lui-drawer title="Middle" hide-trigger>
          <lui-modal title="Inner" hide-trigger></lui-modal>
        </lui-drawer>
      </lui-modal>
    `);
    const outer = host.querySelector('lui-modal');
    const middle = outer.querySelector('lui-drawer');
    const inner = middle.querySelector('lui-modal');

    await openFrom(defaultTrigger(outer), outer);
    middle.openDrawer();
    await middle.updateComplete;
    inner.openModal();
    await inner.updateComplete;
    expect(outer.open).toBe(true);

    await escape(outer, middle, inner);
    expect(inner.open).toBe(false);
    expect(middle.open).toBe(true);
    expect(outer.open).toBe(true);
  });
});
