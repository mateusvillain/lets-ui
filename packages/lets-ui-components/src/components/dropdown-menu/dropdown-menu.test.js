import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LuiDropdownMenu, LuiMenuItem } from './dropdown-menu.ts';
import { LuiButton } from '../button/button.ts';
import { LuiIconButton } from '../icon-button/icon-button.ts';

customElements.define('lui-dropdown-menu', LuiDropdownMenu);
customElements.define('lui-menu-item', LuiMenuItem);
customElements.define('lui-button', LuiButton);
customElements.define('lui-icon-button', LuiIconButton);

const items =
  '<lui-menu-item slot="items" label="Editar"></lui-menu-item><lui-menu-item slot="items" label="Excluir"></lui-menu-item>';

const triggers = {
  'a native button': '<button slot="trigger">Ações</button>',
  'a lui-button': '<lui-button slot="trigger" label="Ações"></lui-button>',
  'a lui-icon-button':
    '<lui-icon-button slot="trigger" aria-label="Ações"><svg aria-hidden="true"></svg></lui-icon-button>',
};

const mounted = [];

async function mount(trigger) {
  const host = document.createElement('div');
  host.innerHTML = `<lui-dropdown-menu>${trigger}${items}</lui-dropdown-menu>`;
  document.body.append(host);
  mounted.push(host);
  const menu = host.querySelector('lui-dropdown-menu');
  const triggerEl = host.querySelector('[slot="trigger"]');
  await menu.updateComplete;
  await triggerEl.updateComplete;
  return { menu, trigger: triggerEl };
}

afterEach(() => {
  mounted.splice(0).forEach((host) => host.remove());
});

// The control that actually holds focus: the host itself for a native button,
// the button in its shadow root for a Let's UI one.
const focusable = (trigger) =>
  trigger.shadowRoot?.querySelector('button') ?? trigger;

const deepActive = () => {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
};

describe.each(Object.entries(triggers))('with %s as trigger', (_, html) => {
  it('marks the trigger as opening a menu', async () => {
    const { trigger } = await mount(html);

    await expect.poll(() => trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('follows the open state on the trigger', async () => {
    const { menu, trigger } = await mount(html);
    const expanded = () => trigger.getAttribute('aria-expanded');

    menu.open = true;
    await expect.poll(expanded).toBe('true');

    menu.open = false;
    await expect.poll(expanded).toBe('false');
  });

  it('returns focus to the trigger on Escape', async () => {
    const { menu, trigger } = await mount(html);

    menu.open = true;
    await menu.updateComplete;
    const item = menu.shadowRoot.querySelector('.menu-item');
    await expect
      .poll(() => {
        item.focus();
        return menu.shadowRoot.activeElement;
      })
      .toBe(item);

    await userEvent.keyboard('{Escape}');

    expect(menu.open).toBe(false);
    expect(deepActive()).toBe(focusable(trigger));
  });

  it('returns focus to the trigger when an item is picked', async () => {
    const { menu, trigger } = await mount(html);

    menu.open = true;
    await menu.updateComplete;
    const item = menu.shadowRoot.querySelector('.menu-item');
    await expect
      .poll(() => {
        item.focus();
        return menu.shadowRoot.activeElement;
      })
      .toBe(item);

    await userEvent.keyboard('{Enter}');

    expect(menu.open).toBe(false);
    expect(deepActive()).toBe(focusable(trigger));
  });
});

describe('picking an item', () => {
  it('lets a menu-select listener move focus elsewhere', async () => {
    const { menu } = await mount(triggers['a native button']);
    const elsewhere = document.createElement('button');
    document.body.append(elsewhere);
    mounted.push(elsewhere);
    menu.addEventListener('menu-select', () => elsewhere.focus());

    menu.open = true;
    await menu.updateComplete;
    const item = menu.shadowRoot.querySelector('.menu-item');
    await expect
      .poll(() => item.checkVisibility({ visibilityProperty: true }))
      .toBe(true);
    item.click();

    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(elsewhere);
  });
});

describe('wrapper', () => {
  it('carries no ARIA of its own', async () => {
    const { menu } = await mount(triggers['a native button']);
    const wrapper = menu.shadowRoot.querySelector('[data-dropdown-trigger]');

    menu.open = true;
    await menu.updateComplete;
    expect(wrapper.hasAttribute('aria-expanded')).toBe(false);
    expect(wrapper.hasAttribute('aria-controls')).toBe(false);
  });

  it('sets no dangling aria-controls on the trigger', async () => {
    const { trigger } = await mount(triggers['a native button']);

    await expect.poll(() => trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
  });
});

describe('swapped trigger', () => {
  it('marks a trigger slotted after the first render', async () => {
    const { menu } = await mount(triggers['a native button']);
    const next = document.createElement('button');
    next.slot = 'trigger';
    next.textContent = 'Mais';

    menu.querySelector('[slot="trigger"]').remove();
    menu.append(next);

    await expect.poll(() => next.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('clears the state from a trigger moved out of the slot', async () => {
    const { menu, trigger } = await mount(triggers['a native button']);
    await expect.poll(() => trigger.getAttribute('aria-haspopup')).toBe('menu');

    trigger.removeAttribute('slot');

    await expect.poll(() => trigger.hasAttribute('aria-haspopup')).toBe(false);
    expect(trigger.hasAttribute('aria-expanded')).toBe(false);
    expect(menu.contains(trigger)).toBe(true);
  });
});
