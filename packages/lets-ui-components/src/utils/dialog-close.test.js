import '../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiButton } from '../components/button/button.ts';
import { LuiDrawer } from '../components/drawer/drawer.ts';
import { LuiModal } from '../components/modal/modal.ts';
import { deepActiveElement as deepActive } from './focus-return.ts';

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

async function open(el) {
  const trigger = el.shadowRoot.querySelector('button[aria-haspopup]');
  trigger.focus();
  trigger.click();
  await el.updateComplete;
  await frame();
  return trigger;
}

describe.each([
  { tag: 'lui-modal', attr: 'data-modal-close', other: 'lui-drawer' },
  { tag: 'lui-drawer', attr: 'data-drawer-close', other: 'lui-modal' },
])('$tag [$attr]', ({ tag, attr, other }) => {
  it('closes from a native button in the actions slot', async () => {
    const host = await mount(
      `<${tag} title="T"><button slot="actions" ${attr}>Cancel</button></${tag}>`
    );
    const el = host.querySelector(tag);
    await open(el);

    host.querySelector(`[${attr}]`).click();
    await el.updateComplete;

    expect(el.open).toBe(false);
  });

  it('closes from an element inside a closer in the body', async () => {
    const host = await mount(
      `<${tag} title="T"><div ${attr}><span id="inner">Cancel</span></div></${tag}>`
    );
    const el = host.querySelector(tag);
    await open(el);

    host.querySelector('#inner').click();
    await el.updateComplete;

    expect(el.open).toBe(false);
  });

  it('closes from the inner button of a lui-button host', async () => {
    const host = await mount(
      `<${tag} title="T"><lui-button slot="actions" label="Cancel" ${attr}></lui-button></${tag}>`
    );
    const el = host.querySelector(tag);
    await open(el);

    host.querySelector('lui-button').shadowRoot.querySelector('button').click();
    await el.updateComplete;

    expect(el.open).toBe(false);
  });

  it('returns focus to the opener', async () => {
    const host = await mount(
      `<${tag} title="T"><button slot="actions" ${attr}>Cancel</button></${tag}>`
    );
    const el = host.querySelector(tag);
    const trigger = await open(el);

    host.querySelector(`[${attr}]`).click();
    await el.updateComplete;

    expect(deepActive()).toBe(trigger);
  });

  it('ignores clicks on other actions', async () => {
    const host = await mount(
      `<${tag} title="T"><button slot="actions">Save</button></${tag}>`
    );
    const el = host.querySelector(tag);
    await open(el);

    host.querySelector('[slot="actions"]').click();
    await el.updateComplete;

    expect(el.open).toBe(true);
  });

  it('still opens from a trigger that carries the attribute', async () => {
    const host = await mount(
      `<${tag} title="T"><button slot="trigger" ${attr}>Open</button></${tag}>`
    );
    const el = host.querySelector(tag);

    host.querySelector('[slot="trigger"]').click();
    await el.updateComplete;

    expect(el.open).toBe(true);
  });

  // Set through `open`: openModal() closes every other modal, the parent
  // included, so this is the only way two nested modals are open at once.
  it('closes only the nested dialog that owns the closer', async () => {
    const host = await mount(`
      <${tag} id="outer" title="Outer">
        <${tag} id="inner" title="Inner" hide-trigger>
          <button slot="actions" ${attr}>Cancel</button>
        </${tag}>
      </${tag}>
    `);
    const outer = host.querySelector('#outer');
    const inner = host.querySelector('#inner');
    outer.open = true;
    inner.open = true;
    await outer.updateComplete;
    await inner.updateComplete;

    inner.querySelector(`[${attr}]`).click();
    await inner.updateComplete;

    expect(inner.open).toBe(false);
    expect(outer.open).toBe(true);
  });

  it('ignores a closer wrapped around a nested dialog', async () => {
    const host = await mount(`
      <${tag} id="outer" title="Outer">
        <div ${attr}>
          <${tag} id="inner" title="Inner" hide-trigger>
            <button id="inside">Inside</button>
          </${tag}>
        </div>
      </${tag}>
    `);
    const outer = host.querySelector('#outer');
    const inner = host.querySelector('#inner');
    outer.open = true;
    inner.open = true;
    await outer.updateComplete;
    await inner.updateComplete;

    host.querySelector('#inside').click();
    await outer.updateComplete;

    expect(outer.open).toBe(true);
    expect(inner.open).toBe(true);
  });

  it('ignores the attribute on the host itself', async () => {
    const host = await mount(
      `<${tag} title="T" ${attr}><button id="body">Body</button></${tag}>`
    );
    const el = host.querySelector(tag);
    await open(el);

    host.querySelector('#body').click();
    await el.updateComplete;

    expect(el.open).toBe(true);
  });

  it('ignores a loading lui-button', async () => {
    const host = await mount(
      `<${tag} title="T"><lui-button slot="actions" label="Cancel" loading ${attr}></lui-button></${tag}>`
    );
    const el = host.querySelector(tag);
    await open(el);

    host.querySelector('lui-button').shadowRoot.querySelector('button').click();
    await el.updateComplete;

    expect(el.open).toBe(true);
  });

  it('ignores a click whose default was prevented', async () => {
    const host = await mount(
      `<${tag} title="T"><button slot="actions" ${attr}>Cancel</button></${tag}>`
    );
    const el = host.querySelector(tag);
    await open(el);
    const closer = host.querySelector(`[${attr}]`);
    closer.addEventListener('click', (e) => e.preventDefault());

    closer.click();
    await el.updateComplete;

    expect(el.open).toBe(true);
  });

  it(`ignores the ${other} attribute`, async () => {
    const otherAttr =
      attr === 'data-modal-close' ? 'data-drawer-close' : 'data-modal-close';
    const host = await mount(
      `<${tag} title="T"><button slot="actions" ${otherAttr}>Cancel</button></${tag}>`
    );
    const el = host.querySelector(tag);
    await open(el);

    host.querySelector(`[${otherAttr}]`).click();
    await el.updateComplete;

    expect(el.open).toBe(true);
  });
});
