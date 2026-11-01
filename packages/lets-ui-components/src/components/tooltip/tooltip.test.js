import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { LuiTooltip } from './tooltip.ts';
import { LuiButton } from '../button/button.ts';
import { LuiIconButton } from '../icon-button/icon-button.ts';
import { LuiCloseButton } from '../close-button/close-button.ts';
import { LuiLink } from '../link/link.ts';

customElements.define('lui-tooltip', LuiTooltip);
customElements.define('lui-button', LuiButton);
customElements.define('lui-icon-button', LuiIconButton);
customElements.define('lui-close-button', LuiCloseButton);
// `lui-link` is defined by the test that needs it not upgraded yet.

const TEXT = 'Editar o item';

const triggers = {
  'a native button': '<button>Editar</button>',
  'a lui-button': '<lui-button label="Editar"></lui-button>',
  'a lui-icon-button':
    '<lui-icon-button aria-label="Editar"><svg aria-hidden="true"></svg></lui-icon-button>',
  'a lui-close-button': '<lui-close-button label="Editar"></lui-close-button>',
};

const mounted = [];

async function mount(trigger, text = TEXT) {
  const host = document.createElement('div');
  host.innerHTML = `
    <button>Antes</button>
    <lui-tooltip text="${text}">${trigger}</lui-tooltip>
    <button>Depois</button>
  `;
  document.body.append(host);
  mounted.push(host);
  const tooltip = host.querySelector('lui-tooltip');
  const [before, after] = host.querySelectorAll(':scope > button');
  await tooltip.updateComplete;
  await tooltip.firstElementChild?.updateComplete;
  return { tooltip, trigger: tooltip.firstElementChild, before, after };
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

const content = (tooltip) =>
  tooltip.shadowRoot.querySelector('.tooltip__content');
const isShown = (tooltip) => getComputedStyle(content(tooltip)).visibility;

// Tests run inside an iframe, and the accessibility tree is per frame.
async function axNodes() {
  const session = cdp();
  const { frameTree } = await session.send('Page.getFrameTree');
  const frames = [frameTree, ...(frameTree.childFrames ?? [])];
  const frame = frames.find((f) => f.frame.url === location.href) ?? frameTree;
  const { nodes } = await session.send('Accessibility.getFullAXTree', {
    frameId: frame.frame.id,
  });
  return nodes.filter((n) => !n.ignored);
}

const describedBy = async (text) =>
  (await axNodes())
    .filter((n) => n.description?.value === text)
    .map((n) => ({ role: n.role?.value, name: n.name?.value }));

describe.each(Object.entries(triggers))('with %s as trigger', (_, html) => {
  it('has a single Tab stop, on the button', async () => {
    const { trigger, before, after } = await mount(html);

    before.focus();
    await userEvent.tab();
    expect(deepActive()).toBe(focusable(trigger));
    await userEvent.tab();
    expect(deepActive()).toBe(after);
  });

  it('describes the button in the accessibility tree', async () => {
    await mount(html);

    await expect
      .poll(() => describedBy(TEXT))
      .toEqual([{ role: 'button', name: 'Editar' }]);
  });

  it('opens on hover', async () => {
    const { tooltip, trigger } = await mount(html);

    expect(isShown(tooltip)).toBe('hidden');
    await userEvent.hover(trigger);
    await expect.poll(() => isShown(tooltip)).toBe('visible');
  });

  it('opens on keyboard focus', async () => {
    const { tooltip, before } = await mount(html);

    before.focus();
    await userEvent.tab();
    await expect.poll(() => isShown(tooltip)).toBe('visible');
  });
});

describe('the description', () => {
  it('follows a change to the text', async () => {
    const { tooltip, trigger } = await mount(triggers['a native button']);

    tooltip.text = 'Outro texto';
    await tooltip.updateComplete;
    expect(trigger.getAttribute('aria-description')).toBe('Outro texto');
  });

  it('is removed from a trigger swapped out of the slot', async () => {
    const { tooltip, trigger } = await mount(triggers['a native button']);
    const next = document.createElement('button');
    next.textContent = 'Novo';

    trigger.replaceWith(next);
    await expect.poll(() => next.getAttribute('aria-description')).toBe(TEXT);
    expect(trigger.hasAttribute('aria-description')).toBe(false);
    expect(tooltip.contains(next)).toBe(true);
  });

  it('reaches a focusable nested in the slotted element', async () => {
    const { trigger } = await mount('<span><button>Editar</button></span>');
    const button = trigger.querySelector('button');

    await expect.poll(() => button.getAttribute('aria-description')).toBe(TEXT);
    expect(trigger.hasAttribute('aria-description')).toBe(false);
  });
});

describe('the visible content', () => {
  it('stays out of the accessibility tree while the trigger is described', async () => {
    const { tooltip } = await mount(
      `<lui-icon-button aria-label="Editar"><svg aria-hidden="true"></svg></lui-icon-button>`
    );

    expect(content(tooltip).getAttribute('aria-hidden')).toBe('true');
  });
});

describe('with a trigger that has nothing focusable', () => {
  const wrapper = (tooltip) =>
    tooltip.shadowRoot.querySelector('[data-tooltip-trigger]');

  it('makes the wrapper the Tab stop', async () => {
    const { tooltip, before, after } = await mount('<span>Texto</span>');

    await expect
      .poll(() => wrapper(tooltip).getAttribute('tabindex'))
      .toBe('0');
    before.focus();
    await userEvent.tab();
    expect(deepActive()).toBe(wrapper(tooltip));
    await userEvent.tab();
    expect(deepActive()).toBe(after);
  });

  it('describes the wrapper and opens on its focus', async () => {
    const { tooltip, before } = await mount('<span>Texto</span>');

    await expect.poll(() => describedBy(TEXT)).toHaveLength(1);
    before.focus();
    await userEvent.tab();
    await expect.poll(() => isShown(tooltip)).toBe('visible');
  });

  it('drops the fallback once a focusable trigger is slotted', async () => {
    const { tooltip, trigger } = await mount('<span>Texto</span>');
    await expect
      .poll(() => wrapper(tooltip).hasAttribute('tabindex'))
      .toBe(true);

    trigger.replaceWith(document.createElement('button'));
    await expect
      .poll(() => wrapper(tooltip).hasAttribute('tabindex'))
      .toBe(false);
    expect(wrapper(tooltip).hasAttribute('aria-describedby')).toBe(false);
  });
});

describe('without a trigger', () => {
  it('renders its own button, described by the content', async () => {
    const host = document.createElement('div');
    host.innerHTML = `<lui-tooltip text="${TEXT}" label="Ajuda"></lui-tooltip>`;
    document.body.append(host);
    mounted.push(host);
    await host.firstElementChild.updateComplete;

    await expect.poll(() => describedBy(TEXT)).toHaveLength(1);
  });
});

describe("the author's own description", () => {
  it('is put back when the trigger leaves the tooltip', async () => {
    const { tooltip, trigger } = await mount(
      '<button aria-description="Do autor">Editar</button>'
    );
    expect(trigger.getAttribute('aria-description')).toBe(TEXT);

    tooltip.after(trigger);
    await expect
      .poll(() => trigger.getAttribute('aria-description'))
      .toBe('Do autor');
  });
});

describe('a trigger that changes after it is slotted', () => {
  it('describes a button rendered later inside the slotted wrapper', async () => {
    const { tooltip, trigger } = await mount('<span></span>');
    const button = document.createElement('button');
    button.textContent = 'Editar';

    trigger.append(button);
    await expect.poll(() => button.getAttribute('aria-description')).toBe(TEXT);
    await expect
      .poll(() =>
        tooltip.shadowRoot
          .querySelector('[data-tooltip-trigger]')
          .hasAttribute('tabindex')
      )
      .toBe(false);
  });
});

describe('with a disabled trigger', () => {
  const wrapper = (tooltip) =>
    tooltip.shadowRoot.querySelector('[data-tooltip-trigger]');

  it.each([
    ['a native button', '<button disabled>Excluir</button>'],
    ['a lui-button', '<lui-button label="Excluir" disabled></lui-button>'],
  ])(
    'keeps the text reachable through the wrapper with %s',
    async (_, html) => {
      const { tooltip, before, after } = await mount(html);

      await expect
        .poll(() => wrapper(tooltip).getAttribute('tabindex'))
        .toBe('0');
      before.focus();
      await userEvent.tab();
      expect(deepActive()).toBe(wrapper(tooltip));
      await userEvent.tab();
      expect(deepActive()).toBe(after);
    }
  );

  it('describes the button again once it is enabled', async () => {
    const { tooltip, trigger } = await mount(
      '<button disabled>Excluir</button>'
    );

    trigger.disabled = false;
    await expect
      .poll(() => trigger.getAttribute('aria-description'))
      .toBe(TEXT);
    await expect
      .poll(() => wrapper(tooltip).hasAttribute('tabindex'))
      .toBe(false);
  });
});

describe('with only whitespace inside', () => {
  it('keeps its own button', async () => {
    const host = document.createElement('div');
    host.innerHTML = `<lui-tooltip text="${TEXT}" label="Ajuda">\n  </lui-tooltip>`;
    document.body.append(host);
    mounted.push(host);
    const tooltip = host.firstElementChild;
    await tooltip.updateComplete;
    // Let `slotchange` run and any re-render it causes settle.
    await new Promise((r) => setTimeout(r, 50));
    await tooltip.updateComplete;

    expect(tooltip.shadowRoot.querySelector('button')?.textContent.trim()).toBe(
      'Ajuda'
    );
  });
});

describe('with a trigger not upgraded yet', () => {
  it('describes its inner control, not its host', async () => {
    const { trigger } = await mount(
      '<lui-link href="#" label="Editar"></lui-link>'
    );
    await new Promise((r) => setTimeout(r));
    expect(trigger.hasAttribute('aria-description')).toBe(false);

    customElements.define('lui-link', LuiLink);
    await expect
      .poll(() =>
        trigger.shadowRoot?.querySelector('a')?.getAttribute('aria-description')
      )
      .toBe(TEXT);
    expect(trigger.hasAttribute('aria-description')).toBe(false);
  });
});

describe('a tooltip that repeats the trigger name', () => {
  const NAME = 'Excluir item';
  const nodeNamed = async (name) =>
    (await axNodes())
      .filter((n) => n.role?.value === 'button' && n.name?.value === name)
      .map((n) => ({ name: n.name.value, description: n.description?.value }));

  it.each([
    [
      'a lui-icon-button',
      `<lui-icon-button aria-label="${NAME}"><svg aria-hidden="true"></svg></lui-icon-button>`,
    ],
    ['a lui-button with label', `<lui-button label="${NAME}"></lui-button>`],
    ['a lui-button with slotted text', `<lui-button>${NAME}</lui-button>`],
    ['a native button', `<button>${NAME}</button>`],
  ])('sets no description on %s', async (_, html) => {
    await mount(html, NAME);

    await expect.poll(() => nodeNamed(NAME)).toEqual([{ name: NAME }]);
  });

  it('matches regardless of case and surrounding whitespace', async () => {
    await mount(`<button>  ${NAME.toUpperCase()} </button>`, NAME);

    await expect
      .poll(() => nodeNamed(NAME.toUpperCase()))
      .toEqual([{ name: NAME.toUpperCase() }]);
  });

  it('describes the trigger once the text stops matching', async () => {
    const { tooltip } = await mount(`<button>${NAME}</button>`, NAME);
    await expect.poll(() => nodeNamed(NAME)).toEqual([{ name: NAME }]);

    tooltip.text = 'Remove o item da lista';
    await expect
      .poll(() => nodeNamed(NAME))
      .toEqual([{ name: NAME, description: 'Remove o item da lista' }]);

    tooltip.text = NAME;
    await expect.poll(() => nodeNamed(NAME)).toEqual([{ name: NAME }]);
  });

  it("follows a change to the trigger's aria-label", async () => {
    const { trigger } = await mount(
      `<lui-icon-button aria-label="Editar"><svg aria-hidden="true"></svg></lui-icon-button>`,
      NAME
    );
    await expect
      .poll(() => nodeNamed('Editar'))
      .toEqual([{ name: 'Editar', description: NAME }]);

    trigger.setAttribute('aria-label', NAME);
    await expect.poll(() => nodeNamed(NAME)).toEqual([{ name: NAME }]);

    trigger.setAttribute('aria-label', 'Editar');
    await expect
      .poll(() => nodeNamed('Editar'))
      .toEqual([{ name: 'Editar', description: NAME }]);
  });

  it("follows a lui-button's label set as a property", async () => {
    const { trigger } = await mount(
      `<lui-button label="${NAME}"></lui-button>`,
      NAME
    );
    await expect.poll(() => nodeNamed(NAME)).toEqual([{ name: NAME }]);

    trigger.label = 'Editar';
    await expect
      .poll(() => nodeNamed('Editar'))
      .toEqual([{ name: 'Editar', description: NAME }]);
  });

  it('compares with the loading text a lui-button renders', async () => {
    await mount(
      `<lui-button loading loading-text="Salvando">${NAME}</lui-button>`,
      NAME
    );

    await expect
      .poll(() => nodeNamed('Salvando'))
      .toEqual([{ name: 'Salvando', description: NAME }]);
  });

  it('leaves hidden text out of the name', async () => {
    await mount(
      `<button><span aria-hidden="true">🗑</span>${NAME}</button>`,
      NAME
    );

    await expect.poll(() => nodeNamed(NAME)).toEqual([{ name: NAME }]);
  });

  it('takes the name from aria-labelledby', async () => {
    await mount(
      `<span id="lbl">Remover</span><button aria-labelledby="lbl">${NAME}</button>`,
      NAME
    );

    await expect
      .poll(() => nodeNamed('Remover'))
      .toEqual([{ name: 'Remover', description: NAME }]);
  });

  it("keeps the author's own description, and restores it on leaving", async () => {
    const { tooltip, trigger } = await mount(
      `<button aria-description="Do autor">${NAME}</button>`,
      NAME
    );
    await expect
      .poll(() => nodeNamed(NAME))
      .toEqual([{ name: NAME, description: 'Do autor' }]);

    tooltip.after(trigger);
    await expect
      .poll(() => trigger.getAttribute('aria-description'))
      .toBe('Do autor');
  });
});

// The pointer stays where an earlier test left it, possibly over the trigger
// of a tooltip mounted in the same spot.
async function parkPointer() {
  const corner = document.createElement('div');
  corner.style.cssText =
    'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px';
  document.body.append(corner);
  await userEvent.hover(corner);
  corner.remove();
}

describe('Escape', () => {
  beforeEach(parkPointer);

  it('puts a tooltip opened by focus away, keeping the focus', async () => {
    const { tooltip, trigger, before } = await mount(
      triggers['a native button']
    );
    before.focus();
    await userEvent.tab();
    await expect.poll(() => isShown(tooltip)).toBe('visible');

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => isShown(tooltip)).toBe('hidden');
    expect(deepActive()).toBe(trigger);
  });

  it('shows it again on the next focus', async () => {
    const { tooltip, before } = await mount(triggers['a lui-button']);
    before.focus();
    await userEvent.tab();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => isShown(tooltip)).toBe('hidden');

    await userEvent.tab();
    await userEvent.tab({ shift: true });
    await expect.poll(() => isShown(tooltip)).toBe('visible');
  });

  it('puts a tooltip opened by hover away, and shows it on the next hover', async () => {
    const { tooltip, trigger, before } = await mount(
      triggers['a native button']
    );
    await userEvent.hover(trigger);
    await expect.poll(() => isShown(tooltip)).toBe('visible');

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => isShown(tooltip)).toBe('hidden');

    await userEvent.hover(before);
    await userEvent.hover(trigger);
    await expect.poll(() => isShown(tooltip)).toBe('visible');
  });

  it('works on the default trigger', async () => {
    const host = document.createElement('div');
    host.innerHTML = `<lui-tooltip text="${TEXT}" label="Ajuda"></lui-tooltip>`;
    document.body.append(host);
    mounted.push(host);
    const tooltip = host.firstElementChild;
    await tooltip.updateComplete;

    tooltip.shadowRoot.querySelector('button').focus();
    await expect.poll(() => isShown(tooltip)).toBe('visible');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => isShown(tooltip)).toBe('hidden');
  });

  it('puts away only the tooltip that is showing', async () => {
    const first = await mount(triggers['a native button']);
    const second = await mount(triggers['a native button']);
    first.trigger.focus();
    await expect.poll(() => isShown(first.tooltip)).toBe('visible');

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => isShown(first.tooltip)).toBe('hidden');
    second.trigger.focus();
    await expect.poll(() => isShown(second.tooltip)).toBe('visible');
  });

  it('is consumed only when it put a tooltip away', async () => {
    const { trigger } = await mount(triggers['a native button']);
    const prevented = [];
    const record = (event) => prevented.push(event.defaultPrevented);
    window.addEventListener('keydown', record);
    try {
      await userEvent.keyboard('{Escape}');
      trigger.focus();
      await userEvent.keyboard('{Escape}');
      await userEvent.keyboard('{Escape}');
    } finally {
      window.removeEventListener('keydown', record);
    }
    expect(prevented).toEqual([false, true, false]);
  });
});

describe('the pointer on the content', () => {
  it('keeps the tooltip open', async () => {
    const { tooltip, trigger } = await mount(triggers['a native button']);
    tooltip.parentElement.style.padding = '80px';
    await userEvent.hover(trigger);
    await expect.poll(() => isShown(tooltip)).toBe('visible');

    await userEvent.hover(content(tooltip));
    await new Promise((r) => setTimeout(r, 100));
    expect(isShown(tooltip)).toBe('visible');
  });

  // A point halfway across the gap between trigger and content.
  const gap = (position, trigger, tip) => {
    const t = trigger.getBoundingClientRect();
    const c = tip.getBoundingClientRect();
    const x = t.left + t.width / 2;
    const y = t.top + t.height / 2;
    return {
      top: [x, (c.bottom + t.top) / 2],
      bottom: [x, (t.bottom + c.top) / 2],
      left: [(c.right + t.left) / 2, y],
      right: [(t.right + c.left) / 2, y],
    }[position];
  };

  it.each(['top', 'bottom', 'left', 'right'])(
    'is bridged across the gap with position %s',
    async (position) => {
      const { tooltip, trigger } = await mount(triggers['a native button']);
      tooltip.parentElement.style.padding = '80px';
      tooltip.position = position;
      await tooltip.updateComplete;
      await userEvent.hover(trigger);

      await expect
        .poll(() => {
          const [x, y] = gap(position, trigger, content(tooltip));
          return tooltip.shadowRoot.elementFromPoint(x, y);
        })
        .toBe(content(tooltip));
    }
  );
});

describe('with reduced motion', () => {
  const emulate = (value) =>
    cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value }],
    });

  afterEach(() => emulate(''));

  const duration = (tooltip) =>
    getComputedStyle(content(tooltip)).transitionDuration;

  it('animates without the preference', async () => {
    const { tooltip } = await mount(triggers['a native button']);
    expect(duration(tooltip)).not.toMatch(/^0s(, 0s)*$/);
  });

  it('shows and hides without a transition', async () => {
    await emulate('reduce');
    const { tooltip } = await mount(triggers['a native button']);
    expect(duration(tooltip)).toMatch(/^0s(, 0s)*$/);
  });
});
