import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiDrawer } from '../drawer/drawer.ts';
import { LuiModal } from './modal.ts';

// Only the elements under test: the full index would pull in every
// component and the Sass each one inlines.
customElements.define('lui-modal', LuiModal);
customElements.define('lui-drawer', LuiDrawer);

const mounted = [];

afterEach(() => {
  mounted.splice(0).forEach((host) => {
    host.querySelectorAll('lui-modal, lui-drawer').forEach((el) => {
      el.open = false;
    });
    host.remove();
  });
  delete document.body.dataset.luiLockCount;
  document.body.style.overflow = '';
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

const lockCount = () => document.body.dataset.luiLockCount ?? '0';
const isLocked = () => document.body.style.overflow === 'hidden';

describe('lui-modal scroll lock', () => {
  it('leaves the count unchanged when closing a closed modal', async () => {
    const host = await mount(`
      <lui-drawer title="D"></lui-drawer>
      <lui-modal title="M"></lui-modal>
    `);
    const drawer = host.querySelector('lui-drawer');
    const modal = host.querySelector('lui-modal');
    drawer.openDrawer();
    await drawer.updateComplete;
    expect(lockCount()).toBe('1');

    modal.closeModal();
    await modal.updateComplete;

    expect(lockCount()).toBe('1');
    expect(isLocked()).toBe(true);
  });

  it('leaves the count unchanged when opening an open modal', async () => {
    const host = await mount('<lui-modal title="M"></lui-modal>');
    const modal = host.querySelector('lui-modal');

    modal.openModal();
    await modal.updateComplete;
    modal.openModal();
    await modal.updateComplete;
    expect(lockCount()).toBe('1');

    modal.closeModal();
    await modal.updateComplete;

    expect(lockCount()).toBe('0');
    expect(isLocked()).toBe(false);
  });

  it('locks when open is set and unlocks when it is cleared', async () => {
    const host = await mount('<lui-modal title="M"></lui-modal>');
    const modal = host.querySelector('lui-modal');

    modal.open = true;
    await modal.updateComplete;
    expect(lockCount()).toBe('1');
    expect(isLocked()).toBe(true);

    modal.removeAttribute('open');
    await modal.updateComplete;
    expect(lockCount()).toBe('0');
    expect(isLocked()).toBe(false);
  });

  it('keeps the page locked for an open drawer across a modal open and close', async () => {
    const host = await mount(`
      <lui-drawer title="D"></lui-drawer>
      <lui-modal title="M"></lui-modal>
    `);
    const drawer = host.querySelector('lui-drawer');
    const modal = host.querySelector('lui-modal');
    drawer.openDrawer();
    await drawer.updateComplete;

    modal.openModal();
    await modal.updateComplete;
    expect(lockCount()).toBe('2');

    modal.closeModal();
    await modal.updateComplete;

    expect(lockCount()).toBe('1');
    expect(isLocked()).toBe(true);
  });

  it('releases the lock when an open modal is removed', async () => {
    const host = await mount('<lui-modal title="M"></lui-modal>');
    const modal = host.querySelector('lui-modal');
    modal.openModal();
    await modal.updateComplete;

    modal.remove();

    expect(lockCount()).toBe('0');
    expect(isLocked()).toBe(false);
  });
});
