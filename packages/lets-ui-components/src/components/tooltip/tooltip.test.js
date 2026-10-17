import '../../../../lets-ui-tokens/dist/letsui.tokens.css';
import { afterEach, describe, expect, it } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { LuiTooltip } from './tooltip.ts';
import { LuiButton } from '../button/button.ts';
import { LuiIconButton } from '../icon-button/icon-button.ts';

customElements.define('lui-tooltip', LuiTooltip);
customElements.define('lui-button', LuiButton);
customElements.define('lui-icon-button', LuiIconButton);

const TEXT = 'Editar o item';

const triggers = {
  'a native button': '<button>Editar</button>',
  'a lui-button': '<lui-button label="Editar"></lui-button>',
  'a lui-icon-button':
    '<lui-icon-button aria-label="Editar"><svg aria-hidden="true"></svg></lui-icon-button>',
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
