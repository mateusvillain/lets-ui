import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { LuiButton } from './button.ts';
import { LuiModal } from '../modal/modal.ts';

customElements.define('lui-button', LuiButton);
customElements.define('lui-modal', LuiModal);

const mounted = [];

async function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const button = host.querySelector('lui-button');
  await button.updateComplete;
  return button;
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

const control = (button) => button.shadowRoot.querySelector('.btn');

describe('state ARIA', () => {
  it('mirrors expanded, haspopup and pressed onto the inner button', async () => {
    const button = await mount(
      '<lui-button label="Menu" aria-expanded="false" aria-haspopup="menu" aria-pressed="true"></lui-button>'
    );

    expect(control(button).getAttribute('aria-expanded')).toBe('false');
    expect(control(button).getAttribute('aria-haspopup')).toBe('menu');
    expect(control(button).getAttribute('aria-pressed')).toBe('true');
  });

  it('follows the host attribute as it changes', async () => {
    const button = await mount(
      '<lui-button label="Menu" aria-expanded="false"></lui-button>'
    );

    button.setAttribute('aria-expanded', 'true');
    await button.updateComplete;
    expect(control(button).getAttribute('aria-expanded')).toBe('true');

    button.removeAttribute('aria-expanded');
    await button.updateComplete;
    expect(control(button).hasAttribute('aria-expanded')).toBe(false);
  });

  it('renders no state ARIA when none is set', async () => {
    const button = await mount('<lui-button label="Save"></lui-button>');

    expect(control(button).hasAttribute('aria-expanded')).toBe(false);
    expect(control(button).hasAttribute('aria-haspopup')).toBe(false);
    expect(control(button).hasAttribute('aria-pressed')).toBe(false);
  });

  it('mirrors expanded but not pressed onto a link', async () => {
    const button = await mount(
      '<lui-button href="/x" label="More" aria-expanded="false" aria-pressed="true"></lui-button>'
    );

    expect(control(button).tagName).toBe('A');
    expect(control(button).getAttribute('aria-expanded')).toBe('false');
    expect(control(button).hasAttribute('aria-pressed')).toBe(false);
  });

  it('announces the open state of the modal it triggers', async () => {
    const host = document.createElement('div');
    host.innerHTML =
      '<lui-modal title="Settings"><lui-button slot="trigger" label="Settings"></lui-button></lui-modal>';
    document.body.append(host);
    mounted.push(host);
    const modal = host.querySelector('lui-modal');
    const button = host.querySelector('lui-button');
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

describe('loading', () => {
  it('keeps slotted content as the accessible name', async () => {
    const button = await mount('<lui-button loading>Confirmar</lui-button>');
    const slot = control(button).querySelector('slot:not([name])');

    expect(control(button).hasAttribute('aria-label')).toBe(false);
    expect(slot).not.toBeNull();
    expect(slot.assignedNodes()[0].textContent).toBe('Confirmar');
  });

  it('still shows the label when it is passed as an attribute', async () => {
    const button = await mount(
      '<lui-button loading label="Save"></lui-button>'
    );

    expect(control(button).textContent.trim()).toBe('Save');
    expect(control(button).getAttribute('aria-label')).toBe('Save');
  });

  it('replaces the content with loading-text', async () => {
    const button = await mount(
      '<lui-button loading loading-text="Salvando">Salvar</lui-button>'
    );

    expect(control(button).querySelector('slot')).toBeNull();
    expect(control(button).textContent.trim()).toBe('Salvando');
    expect(control(button).getAttribute('aria-label')).toBe('Salvando');
  });

  it('hides the prefix and suffix icons', async () => {
    const button = await mount(
      '<lui-button loading label="Save"><span slot="prefix">*</span></lui-button>'
    );

    expect(control(button).querySelector('slot[name="prefix"]')).toBeNull();
  });
});
