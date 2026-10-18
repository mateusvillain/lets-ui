import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiIconButton } from './icon-button.ts';
import { LuiModal } from '../modal/modal.ts';
import { LuiDrawer } from '../drawer/drawer.ts';
import { exposed } from '../../test/ax-tree.js';

customElements.define('lui-icon-button', LuiIconButton);
customElements.define('lui-modal', LuiModal);
customElements.define('lui-drawer', LuiDrawer);

const icon = '<svg aria-hidden="true" width="24" height="24"></svg>';
const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const button = host.querySelector('lui-icon-button');
  await button.updateComplete;
  return button;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const control = (button) => button.shadowRoot.querySelector('button');

describe('accessible name', () => {
  it('passes aria-label to the inner button', async () => {
    const button = await mount(
      `<lui-icon-button aria-label="Fechar">${icon}</lui-icon-button>`
    );

    expect(control(button).getAttribute('aria-label')).toBe('Fechar');
  });

  it('takes an aria-label set as a property, without reflecting it', async () => {
    const button = await mount(`<lui-icon-button>${icon}</lui-icon-button>`);

    button.ariaLabel = 'Fechar';
    await button.updateComplete;
    expect(button.hasAttribute('aria-label')).toBe(false);
    expect(control(button).getAttribute('aria-label')).toBe('Fechar');
  });

  it('names the button alone in the accessibility tree', async () => {
    await mount(
      `<lui-icon-button aria-label="Fechar">${icon}</lui-icon-button>`
    );

    expect(await exposed('Fechar')).toEqual(['button "Fechar"']);
  });

  it('renders no empty aria-label', async () => {
    const button = await mount(`<lui-icon-button>${icon}</lui-icon-button>`);

    expect(control(button).hasAttribute('aria-label')).toBe(false);
  });
});

describe('size', () => {
  it('renders lg and md', async () => {
    const lg = await mount(
      `<lui-icon-button size="lg" aria-label="Fechar">${icon}</lui-icon-button>`
    );
    const md = await mount(
      `<lui-icon-button size="md" aria-label="Fechar">${icon}</lui-icon-button>`
    );

    expect(control(lg).classList.contains('icon-button--lg')).toBe(true);
    expect(control(md).classList.contains('icon-button--md')).toBe(true);
  });

  it('falls back to md for a size that has no styles', async () => {
    const button = await mount(
      `<lui-icon-button size="sm" aria-label="Fechar">${icon}</lui-icon-button>`
    );
    const { width, height } = control(button).getBoundingClientRect();

    expect(control(button).classList.contains('icon-button--md')).toBe(true);
    expect(width).toBeGreaterThanOrEqual(24);
    expect(height).toBeGreaterThanOrEqual(24);
  });
});

describe('disabled', () => {
  it('disables the inner button without an invalid aria-disabled', async () => {
    const button = await mount(
      `<lui-icon-button aria-label="Fechar" disabled>${icon}</lui-icon-button>`
    );

    expect(control(button).disabled).toBe(true);
    expect(control(button).hasAttribute('aria-disabled')).toBe(false);
  });
});

describe('state ARIA', () => {
  it('mirrors expanded, haspopup and pressed onto the inner button', async () => {
    const button = await mount(
      `<lui-icon-button aria-label="Menu" aria-expanded="false" aria-haspopup="menu" aria-pressed="true">${icon}</lui-icon-button>`
    );

    expect(control(button).getAttribute('aria-expanded')).toBe('false');
    expect(control(button).getAttribute('aria-haspopup')).toBe('menu');
    expect(control(button).getAttribute('aria-pressed')).toBe('true');
  });

  it('follows the host attribute as it changes', async () => {
    const button = await mount(
      `<lui-icon-button aria-label="Menu" aria-expanded="false">${icon}</lui-icon-button>`
    );

    button.setAttribute('aria-expanded', 'true');
    await button.updateComplete;
    expect(control(button).getAttribute('aria-expanded')).toBe('true');

    button.setAttribute('aria-expanded', 'false');
    await button.updateComplete;
    expect(control(button).getAttribute('aria-expanded')).toBe('false');
  });

  it('takes the state set as a property, without reflecting it', async () => {
    const button = await mount(
      `<lui-icon-button aria-label="Negrito">${icon}</lui-icon-button>`
    );

    button.ariaPressed = 'true';
    await button.updateComplete;
    expect(button.hasAttribute('aria-pressed')).toBe(false);
    expect(control(button).getAttribute('aria-pressed')).toBe('true');

    button.ariaPressed = null;
    await button.updateComplete;
    expect(control(button).hasAttribute('aria-pressed')).toBe(false);
  });

  it('removes the ARIA attributes from the host', async () => {
    const button = await mount(
      `<lui-icon-button aria-label="Menu" aria-expanded="false" aria-haspopup="menu" aria-pressed="true">${icon}</lui-icon-button>`
    );

    expect(button.ariaHasPopup).toBe('menu');
    expect(
      button.getAttributeNames().filter((n) => n.startsWith('aria-'))
    ).toEqual([]);
  });

  it('exposes the state on the button alone in the accessibility tree', async () => {
    await mount(
      `<lui-icon-button aria-label="Menu" aria-expanded="false" aria-haspopup="menu">${icon}</lui-icon-button>`
    );

    expect(await exposed('Menu')).toEqual([
      'button "Menu" hasPopup=menu expanded=false',
    ]);
  });

  it('renders no attribute for an empty state value', async () => {
    const button = await mount(
      `<lui-icon-button aria-label="Menu" aria-expanded aria-pressed="">${icon}</lui-icon-button>`
    );

    expect(control(button).hasAttribute('aria-expanded')).toBe(false);
    expect(control(button).hasAttribute('aria-pressed')).toBe(false);
  });

  it('renders no state ARIA when none is set', async () => {
    const button = await mount(
      `<lui-icon-button aria-label="Fechar">${icon}</lui-icon-button>`
    );

    expect(control(button).hasAttribute('aria-expanded')).toBe(false);
    expect(control(button).hasAttribute('aria-haspopup')).toBe(false);
    expect(control(button).hasAttribute('aria-pressed')).toBe(false);
  });

  it('announces the open state of the modal it triggers', async () => {
    const host = document.createElement('div');
    host.innerHTML = `<lui-modal title="Settings"><lui-icon-button slot="trigger" aria-label="Settings">${icon}</lui-icon-button></lui-modal>`;
    document.body.append(host);
    mounted.push(host);
    const modal = host.querySelector('lui-modal');
    const button = host.querySelector('lui-icon-button');
    await modal.updateComplete;
    await button.updateComplete;
    const expanded = () => control(button).getAttribute('aria-expanded');

    // The modal finds its trigger on `slotchange`, after the first render.
    await expect.poll(expanded).toBe('false');
    expect(control(button).getAttribute('aria-haspopup')).toBe('dialog');

    expect(await exposed('Settings')).toContain(
      'button "Settings" hasPopup=dialog expanded=false'
    );
    expect(
      button.getAttributeNames().filter((n) => n.startsWith('aria-'))
    ).toEqual([]);

    modal.open = true;
    await expect.poll(expanded).toBe('true');
    await expect
      .poll(() => exposed('Settings'))
      .toContain('button "Settings" hasPopup=dialog expanded=true');

    modal.open = false;
    await modal.updateComplete;
  });

  it('announces the open state of the drawer it triggers', async () => {
    const host = document.createElement('div');
    host.innerHTML = `<lui-drawer title="Filtros"><lui-icon-button slot="trigger" aria-label="Filtros">${icon}</lui-icon-button></lui-drawer>`;
    document.body.append(host);
    mounted.push(host);
    const drawer = host.querySelector('lui-drawer');
    const button = host.querySelector('lui-icon-button');
    await drawer.updateComplete;
    await button.updateComplete;
    const expanded = () => control(button).getAttribute('aria-expanded');

    await expect.poll(expanded).toBe('false');
    expect(control(button).getAttribute('aria-haspopup')).toBe('dialog');

    expect(await exposed('Filtros')).toContain(
      'button "Filtros" hasPopup=dialog expanded=false'
    );
    expect(
      button.getAttributeNames().filter((n) => n.startsWith('aria-'))
    ).toEqual([]);

    drawer.open = true;
    await expect.poll(expanded).toBe('true');
    await expect
      .poll(() => exposed('Filtros'))
      .toContain('button "Filtros" hasPopup=dialog expanded=true');

    drawer.open = false;
    await drawer.updateComplete;
  });
});
