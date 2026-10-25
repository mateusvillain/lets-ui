import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import {
  LuiCommandGroup,
  LuiCommandItem,
  LuiCommandPalette,
  LuiCommandTag,
} from './command-palette.ts';

// Only the elements under test: the full index would pull in every
// component and the Sass each one inlines.
customElements.define('lui-command-palette', LuiCommandPalette);
customElements.define('lui-command-group', LuiCommandGroup);
customElements.define('lui-command-item', LuiCommandItem);
customElements.define('lui-command-tag', LuiCommandTag);

const mounted = [];

afterEach(() => {
  mounted.splice(0).forEach((host) => {
    host.querySelectorAll('lui-command-palette').forEach((el) => {
      el.open = false;
    });
    host.remove();
  });
  delete document.body.dataset.luiLockCount;
  document.body.style.overflow = '';
});

const frame = () => new Promise((r) => requestAnimationFrame(r));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const MARKUP = `
  <button id="opener">Open</button>
  <lui-command-palette>
    <lui-command-tag value="pages">Pages</lui-command-tag>
    <lui-command-tag value="users">Users</lui-command-tag>
    <lui-command-group label="Recent">
      <lui-command-item value="calendar" label="Calendar" caption="Page" shortcut="⌘,1" tag="pages"></lui-command-item>
      <lui-command-item value="settings" label="Settings" description="Preferências" tag="pages"></lui-command-item>
    </lui-command-group>
    <lui-command-group label="Users">
      <lui-command-item value="alex" label="Alex Johnson" avatar="Alex Johnson" tag="users"></lui-command-item>
    </lui-command-group>
  </lui-command-palette>
`;

async function mount(html = MARKUP) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  mounted.push(host);
  const palette = host.querySelector('lui-command-palette');
  await palette.updateComplete;
  return { host, palette };
}

async function settle(palette) {
  await palette.updateComplete;
  await frame();
  await palette.updateComplete;
}

const $ = (palette, selector) => palette.shadowRoot.querySelector(selector);
const $$ = (palette, selector) =>
  Array.from(palette.shadowRoot.querySelectorAll(selector));
const input = (palette) => $(palette, 'input');
const options = (palette) => $$(palette, '[role="option"]');
const labels = (palette) =>
  options(palette).map(
    (o) => o.querySelector('.command-palette__title').textContent
  );

function press(target, key, init = {}) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      composed: true,
      cancelable: true,
      ...init,
    })
  );
}

async function type(palette, text) {
  const el = input(palette);
  el.value = text;
  el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await palette.updateComplete;
}

describe('lui-command-palette', () => {
  it('opens on Ctrl+K and focuses the search field', async () => {
    const { palette } = await mount();
    press(document.body, 'k', { ctrlKey: true });
    await settle(palette);

    expect(palette.open).toBe(true);
    expect(palette.shadowRoot.activeElement).toBe(input(palette));
  });

  it('opens on ⌘K and closes on a second ⌘K', async () => {
    const { palette } = await mount();
    press(document.body, 'k', { metaKey: true });
    await settle(palette);
    expect(palette.open).toBe(true);

    press(document.body, 'k', { metaKey: true });
    await settle(palette);
    expect(palette.open).toBe(false);
  });

  it('leaves the shortcut alone with no-hotkey', async () => {
    const { palette } = await mount();
    palette.noHotkey = true;
    press(document.body, 'k', { ctrlKey: true });
    await settle(palette);
    expect(palette.open).toBe(false);
  });

  it('closes on Escape and returns focus to the opener', async () => {
    const { host, palette } = await mount();
    const opener = host.querySelector('#opener');
    opener.focus();
    palette.show();
    await settle(palette);

    press(input(palette), 'Escape');
    await settle(palette);

    expect(palette.open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('exposes dialog, combobox, listbox and option roles', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);

    const dialog = $(palette, '[role="dialog"]');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const listbox = $(palette, '[role="listbox"]');
    expect(input(palette).getAttribute('aria-controls')).toBe(listbox.id);
    expect(options(palette)).toHaveLength(3);
    expect($$(palette, '[role="group"][aria-labelledby]')).toHaveLength(2);
  });

  it('filters as the user types, ignoring case and accents', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);

    await type(palette, 'CAL');
    expect(labels(palette)).toEqual(['Calendar']);

    await type(palette, 'preferencias');
    expect(labels(palette)).toEqual(['Settings']);
  });

  it('shows the empty state when nothing matches', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);

    await type(palette, 'zzz');
    expect(options(palette)).toHaveLength(0);
    expect($(palette, '.command-palette__empty').textContent).toBe(
      'No results found'
    );
    expect(input(palette).getAttribute('aria-expanded')).toBe('false');
  });

  it('announces the result count once typing pauses', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);
    const status = () => $(palette, '[role="status"]').textContent.trim();

    await type(palette, 'c');
    await type(palette, 'ca');
    await type(palette, 'cal');
    expect(status()).toBe('');

    await wait(450);
    await palette.updateComplete;
    expect(status()).toBe('1 result');

    await type(palette, 'zzz');
    await wait(450);
    await palette.updateComplete;
    expect(status()).toBe('No results found');
  });

  it('makes the rest of the page inert while open', async () => {
    const { host, palette } = await mount();
    const opener = host.querySelector('#opener');
    opener.focus();
    palette.show();
    await settle(palette);

    expect(opener.inert).toBe(true);
    expect(palette.inert).toBe(false);

    palette.hide();
    await settle(palette);
    expect(opener.inert).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('leaves alone what was inert before it opened', async () => {
    const { host, palette } = await mount();
    const opener = host.querySelector('#opener');
    opener.inert = true;
    palette.show();
    await settle(palette);
    palette.hide();
    await settle(palette);

    expect(opener.inert).toBe(true);
  });

  it('names the listbox and describes items by their shortcut', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);

    expect($(palette, '[role="listbox"]').getAttribute('aria-label')).toBe(
      'Results'
    );
    const calendar = options(palette)[0];
    const ids = calendar.getAttribute('aria-describedby').split(' ');
    const shortcut = ids.find((id) => id.endsWith('-shortcut'));
    expect(palette.shadowRoot.getElementById(shortcut).textContent).toBe('⌘,1');
  });

  it('clears the query from the clear control', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);
    expect($(palette, '.command-palette__clear')).toBeNull();

    await type(palette, 'cal');
    $(palette, '.command-palette__clear').click();
    await palette.updateComplete;

    expect(input(palette).value).toBe('');
    expect(options(palette)).toHaveLength(3);
    expect(palette.shadowRoot.activeElement).toBe(input(palette));
  });

  it('moves the highlight with the arrow keys and wraps', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);
    const field = input(palette);
    const activeLabel = () =>
      palette.shadowRoot
        .getElementById(field.getAttribute('aria-activedescendant'))
        .querySelector('.command-palette__title').textContent;

    expect(activeLabel()).toBe('Calendar');
    press(field, 'ArrowDown');
    await palette.updateComplete;
    expect(activeLabel()).toBe('Settings');
    press(field, 'ArrowUp');
    press(field, 'ArrowUp');
    await palette.updateComplete;
    expect(activeLabel()).toBe('Alex Johnson');
  });

  it('emits lui-select on Enter and closes', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);
    let detail = null;
    palette.addEventListener('lui-select', (e) => {
      detail = e.detail;
    });

    press(input(palette), 'ArrowDown');
    await palette.updateComplete;
    press(input(palette), 'Enter');
    await palette.updateComplete;

    expect(detail.value).toBe('settings');
    expect(detail.item.tagName).toBe('LUI-COMMAND-ITEM');
    expect(palette.open).toBe(false);
  });

  it('stays open when lui-select is cancelled', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);
    palette.addEventListener('lui-select', (e) => e.preventDefault());

    options(palette)[0].click();
    await palette.updateComplete;
    expect(palette.open).toBe(true);
  });

  it('filters by the pressed tag and releases it on a second press', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);
    const [, users] = $$(palette, '.command-palette__tag');

    users.click();
    await palette.updateComplete;
    expect(users.getAttribute('aria-pressed')).toBe('true');
    expect(labels(palette)).toEqual(['Alex Johnson']);

    users.click();
    await palette.updateComplete;
    expect(users.getAttribute('aria-pressed')).toBe('false');
    expect(options(palette)).toHaveLength(3);
  });

  it('renders the avatar leading slot for user items', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);
    const alex = options(palette)[2];
    expect(alex.querySelector('lui-avatar')).not.toBeNull();
    expect(
      options(palette)[0].querySelector('lui-shortcut').getAttribute('keys')
    ).toBe('⌘,1');
  });

  it('picks up items added after it rendered', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);

    const item = document.createElement('lui-command-item');
    item.setAttribute('label', 'Billing');
    palette.querySelector('lui-command-group').append(item);
    await new Promise((r) => setTimeout(r));
    await palette.updateComplete;

    expect(labels(palette)).toContain('Billing');
  });

  it('picks up items that replace its children', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);

    const item = document.createElement('lui-command-item');
    item.setAttribute('label', 'Billing');
    palette.replaceChildren(item);
    await new Promise((r) => setTimeout(r));
    await palette.updateComplete;

    expect(labels(palette)).toEqual(['Billing']);
  });

  it('keeps Tab inside the dialog', async () => {
    const { palette } = await mount();
    palette.show();
    await settle(palette);
    const tags = $$(palette, '.command-palette__tag');

    tags[tags.length - 1].focus();
    press(tags[tags.length - 1], 'Tab');
    expect(palette.shadowRoot.activeElement).toBe(input(palette));
  });
});
