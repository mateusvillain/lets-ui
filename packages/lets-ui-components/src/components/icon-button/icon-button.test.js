import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import iconButtonCss from '../../../../styles/src/components/_icon-button.scss?inline';
import { LuiIconButton } from './icon-button.ts';
import { LuiModal } from '../modal/modal.ts';
import { LuiDrawer } from '../drawer/drawer.ts';

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

  it('reflects an aria-label set as a property to the host', async () => {
    const button = await mount(`<lui-icon-button>${icon}</lui-icon-button>`);

    button.ariaLabel = 'Fechar';
    await button.updateComplete;
    expect(button.getAttribute('aria-label')).toBe('Fechar');
    expect(control(button).getAttribute('aria-label')).toBe('Fechar');
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

    modal.open = true;
    await expect.poll(expanded).toBe('true');

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

    drawer.open = true;
    await expect.poll(expanded).toBe('true');

    drawer.open = false;
    await drawer.updateComplete;
  });
});

// --- Pressed state ---

// The state layer animates `background-color` for up to 220ms.
const settle = () => new Promise((r) => setTimeout(r, 300));

const ring = (el) => getComputedStyle(el, '::after');
const fill = (el) => getComputedStyle(el).backgroundColor;

// The pointer stays where the last test left it, which may be right where the
// next button mounts. Parking it on an element of its own, off to the corner,
// keeps a stray hover out of the fill comparisons.
async function park() {
  const spot = document.createElement('div');
  spot.style.cssText =
    'position: fixed; right: 0; bottom: 0; width: 8px; height: 8px';
  document.body.append(spot);
  await userEvent.hover(spot);
  spot.remove();
}

// Mounts a resting and a pressed button side by side.
async function pair(size = 'md', extra = '') {
  await park();
  const host = document.createElement('div');
  host.innerHTML = `
    <lui-icon-button size="${size}" aria-label="Itálico" ${extra}>${icon}</lui-icon-button>
    <lui-icon-button size="${size}" aria-label="Negrito" aria-pressed="true" ${extra}>${icon}</lui-icon-button>`;
  document.body.append(host);
  mounted.push(host);
  const [rest, pressed] = host.querySelectorAll('lui-icon-button');
  await rest.updateComplete;
  await pressed.updateComplete;
  return { rest, pressed };
}

describe('pressed state', () => {
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it.each(['light', 'dark'])(
    'fills the pressed button with the neutral container in the %s theme',
    async (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      const { rest, pressed } = await pair();
      await settle();
      const probe = document.createElement('div');
      probe.style.backgroundColor =
        'var(--lui-color-neutral-background-container)';
      document.body.append(probe);
      mounted.push(probe);

      expect(fill(control(pressed))).toBe(
        getComputedStyle(probe).backgroundColor
      );
      expect(fill(control(pressed))).not.toBe(fill(control(rest)));
    }
  );

  it('draws no ring outside forced colors', async () => {
    const { pressed } = await pair();

    expect(ring(control(pressed)).content).toBe('none');
  });

  it('does not style aria-pressed="false"', async () => {
    const { rest } = await pair();
    const off = await mount(
      `<lui-icon-button aria-label="Negrito" aria-pressed="false">${icon}</lui-icon-button>`
    );
    await settle();

    expect(fill(control(off))).toBe(fill(control(rest)));
  });

  it.each(['lg', 'md'])('keeps the %s layout when pressed', async (size) => {
    const { rest, pressed } = await pair(size);
    const a = control(rest).getBoundingClientRect();
    const b = control(pressed).getBoundingClientRect();

    expect(b.width).toBe(a.width);
    expect(b.height).toBe(a.height);
  });

  it('still tints on hover', async () => {
    const { pressed } = await pair();
    await settle();
    const before = fill(control(pressed));

    await userEvent.hover(control(pressed));
    await settle();
    expect(fill(control(pressed))).not.toBe(before);
  });

  it('keeps the focus ring', async () => {
    const { pressed } = await pair();

    await userEvent.tab();
    await userEvent.tab();
    expect(pressed.shadowRoot.activeElement).toBe(control(pressed));
    expect(getComputedStyle(control(pressed)).boxShadow).not.toBe('none');
  });

  it('shows pressed and disabled together, without a hover tint', async () => {
    const { pressed } = await pair('md', 'disabled');
    await settle();
    const before = fill(control(pressed));

    expect(Number(getComputedStyle(control(pressed)).opacity)).toBeLessThan(1);

    await userEvent.hover(control(pressed), { force: true });
    await settle();
    expect(fill(control(pressed))).toBe(before);
  });

  it('matches the CSS class without the Web Component', async () => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(iconButtonCss);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    const { pressed } = await pair();
    const host = document.createElement('div');
    host.innerHTML = `<button class="icon-button icon-button--md" type="button" aria-label="Negrito" aria-pressed="true">${icon}</button>`;
    document.body.append(host);
    mounted.push(host);
    await settle();
    const plain = host.querySelector('button');

    try {
      expect(fill(plain)).toBe(fill(control(pressed)));
      expect(fill(plain)).not.toBe('rgba(0, 0, 0, 0)');
    } finally {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (s) => s !== sheet
      );
    }
  });
});

describe('pressed state in forced colors', () => {
  const emulate = (value) =>
    cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value }],
    });

  afterEach(() => emulate(''));

  it('fills the pressed button with Highlight', async () => {
    const { rest, pressed } = await pair();
    await emulate('active');
    await settle();
    const probe = document.createElement('div');
    probe.style.cssText =
      'forced-color-adjust: none; background-color: Highlight; color: HighlightText';
    document.body.append(probe);
    mounted.push(probe);

    expect(fill(control(pressed))).toBe(
      getComputedStyle(probe).backgroundColor
    );
    expect(fill(control(pressed))).not.toBe(fill(control(rest)));
    expect(getComputedStyle(control(pressed)).color).toBe(
      getComputedStyle(probe).color
    );
    // In forced colors the pressed state also gets an inner ring.
    const on = ring(control(pressed));
    expect(on.borderTopStyle).toBe('solid');
    expect(on.borderTopWidth).toBe('2px');
    expect(on.pointerEvents).toBe('none');
    expect(ring(control(rest)).content).toBe('none');
  });

  it('greys out a pressed and disabled button instead of highlighting it', async () => {
    const { pressed } = await pair('md', 'disabled');
    await emulate('active');
    await settle();
    const probe = document.createElement('div');
    probe.style.cssText =
      'forced-color-adjust: none; background-color: ButtonFace; color: GrayText; border-color: Highlight';
    document.body.append(probe);
    mounted.push(probe);
    const system = getComputedStyle(probe);

    expect(fill(control(pressed))).toBe(system.backgroundColor);
    expect(fill(control(pressed))).not.toBe(system.borderTopColor);
    expect(getComputedStyle(control(pressed)).color).toBe(system.color);
    // The ring still marks the pressed state, in the same grey.
    expect(ring(control(pressed)).borderTopStyle).toBe('solid');
    expect(ring(control(pressed)).borderTopColor).toBe(system.color);
  });

  it('keeps the system focus outline on a pressed button', async () => {
    const { pressed } = await pair();
    await emulate('active');

    await userEvent.tab();
    await userEvent.tab();
    const style = getComputedStyle(control(pressed));
    expect(style.outlineStyle).toBe('solid');
    expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
    // The ring follows the radius `:focus` switches to.
    await settle();
    expect(ring(control(pressed)).borderTopLeftRadius).toBe(
      style.borderTopLeftRadius
    );
  });
});
