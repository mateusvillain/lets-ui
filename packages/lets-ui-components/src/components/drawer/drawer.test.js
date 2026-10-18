import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiDrawer } from './drawer.ts';

// Only the element under test: the full index would pull in every
// component and the Sass each one inlines.
customElements.define('lui-drawer', LuiDrawer);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const el = host.querySelector('lui-drawer');
  await el.updateComplete;
  // The slotchange that flags the trigger slot lands after the first render.
  await new Promise((r) => requestAnimationFrame(r));
  await el.updateComplete;
  return el;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => {
    host.querySelector('lui-drawer')?.closeDrawer();
    host.remove();
  });
});

const panel = (el) => el.shadowRoot.querySelector('[data-drawer-panel]');

describe('lui-drawer trigger ARIA', () => {
  it('points the default trigger at the drawer in its own shadow root', async () => {
    const el = await mount('<lui-drawer title="T"></lui-drawer>');
    const trigger = el.shadowRoot.querySelector('button[aria-haspopup]');

    const id = trigger.getAttribute('aria-controls');
    expect(el.shadowRoot.getElementById(id)).toBe(panel(el));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('sets no dangling aria-controls on a slotted trigger', async () => {
    const el = await mount(
      '<lui-drawer title="T"><button slot="trigger">Open</button></lui-drawer>'
    );
    const trigger = el.querySelector('[slot="trigger"]');

    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps aria-expanded in sync on a slotted trigger', async () => {
    const el = await mount(
      '<lui-drawer title="T"><button slot="trigger">Open</button></lui-drawer>'
    );
    const trigger = el.querySelector('[slot="trigger"]');

    el.openDrawer();
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);

    el.closeDrawer();
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
