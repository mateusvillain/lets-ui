import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiIconButton } from './icon-button.ts';
import { LuiModal } from '../modal/modal.ts';

customElements.define('lui-icon-button', LuiIconButton);
customElements.define('lui-modal', LuiModal);

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

  it('renders no empty aria-label', async () => {
    const button = await mount(`<lui-icon-button>${icon}</lui-icon-button>`);

    expect(control(button).hasAttribute('aria-label')).toBe(false);
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

    button.removeAttribute('aria-expanded');
    await button.updateComplete;
    expect(control(button).hasAttribute('aria-expanded')).toBe(false);
  });

  it('reflects the state set as a property to the host attribute', async () => {
    const button = await mount(
      `<lui-icon-button aria-label="Negrito">${icon}</lui-icon-button>`
    );

    button.ariaPressed = 'true';
    await button.updateComplete;
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(control(button).getAttribute('aria-pressed')).toBe('true');
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

    modal.open = true;
    await expect.poll(expanded).toBe('true');

    modal.open = false;
    await modal.updateComplete;
  });
});
