import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiModal } from './modal.ts';

// Only the element under test: the full index would pull in every
// component and the Sass each one inlines.
customElements.define('lui-modal', LuiModal);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const el = host.querySelector('lui-modal');
  await el.updateComplete;
  // The slotchange that flags the trigger slot lands after the first render.
  await new Promise((r) => requestAnimationFrame(r));
  await el.updateComplete;
  return el;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => {
    host.querySelector('lui-modal')?.closeModal();
    host.remove();
  });
});

const panel = (el) => el.shadowRoot.querySelector('[data-modal-dialog]');

describe('lui-modal trigger ARIA', () => {
  it('points the default trigger at the modal in its own shadow root', async () => {
    const el = await mount('<lui-modal title="T"></lui-modal>');
    const trigger = el.shadowRoot.querySelector('button[aria-haspopup]');

    const id = trigger.getAttribute('aria-controls');
    expect(el.shadowRoot.getElementById(id)).toBe(panel(el));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('sets no dangling aria-controls on a slotted trigger', async () => {
    const el = await mount(
      '<lui-modal title="T"><button slot="trigger">Open</button></lui-modal>'
    );
    const trigger = el.querySelector('[slot="trigger"]');

    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps aria-expanded in sync on a slotted trigger', async () => {
    const el = await mount(
      '<lui-modal title="T"><button slot="trigger">Open</button></lui-modal>'
    );
    const trigger = el.querySelector('[slot="trigger"]');

    el.openModal();
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);

    el.closeModal();
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
